// @deno-types="npm:@types/express@4.17.21"
import express from "npm:express";
import { db } from "../db/db.ts";
import { OAuth2RequestError, generateState } from "npm:arctic";
import { github, lucia, validateRequest } from "../auth/auth.ts";
import { serializeCookie, parseCookies } from "npm:oslo/cookie"
import { userTable } from "../db/schema.ts";
import { eq } from "npm:drizzle-orm";
import { generateId } from "npm:lucia";

const authRouter = express.Router()

authRouter.get("/login/github", async (req, res) => {
    const state = generateState()
    const url = await github.createAuthorizationURL(state)

    res
        .header({
            "Location": url.toString(),
            "Set-Cookie": serializeCookie("github_oauth_state", state, {
                httpOnly: true,
                secure: Deno.env.get("ENV") === "production",
                maxAge: 60*10,
                path: "/"
            }),
        })
        .status(302)
        .redirect(url.toString())
})

interface GitHubUserResult {
	id: number;
	login: string;
}

authRouter.get("/login/github/callback", async (req, res) => {
    const cookies = parseCookies(req.headers.cookie!)
    const stateCookie = cookies.get("github_oauth_state")


    // const url = new URL(req.url)
    const state = req.query.state as string
    const code = req.query.code as string

    if(!state || !stateCookie || !code || stateCookie !== state) {
        return res.status(500).json({message: "Auth Error"})
    }

    try {
        const tokens = await github.validateAuthorizationCode(code)
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        })
        
        const userResult: GitHubUserResult =  await userResponse.json() 

        const existingUser = (await db.select().from(userTable).where(eq(userTable.githubId, userResult.id)))[0]

        if(existingUser) {
            const session = await lucia.createSession(existingUser.id, {})
            const sessionCookie = lucia.createSessionCookie(session.id)

            return res
                .status(302)
                .header({
                    // "Location": "/",
                    "Set-Cookie": sessionCookie.serialize()
                })
                // .json({
                //     message: `Yay! Existing user ${userResult.login} is logged in`
                // })
                .redirect(Deno.env.get("CLIENT_URL")+"/?login")
        }

        const userId = generateId(15)

        await db.insert(userTable).values({
            id: userId,
            githubId: userResult.id,
            username: userResult.login
        })

        const session = await lucia.createSession(userId, {})
        const sessionCookie = lucia.createSessionCookie(session.id)

        return res
            .status(302)
            .header({
                // "Location": "/",
                "Set-Cookie": sessionCookie.serialize()
            })
            // .json({
            //     message: `Yay! New user(${userResult.login}) created and logged in`
            // })
            .redirect(Deno.env.get("CLIENT_URL")+"/?login")
    } catch(e) {
        if (e instanceof OAuth2RequestError) {
            return res.status(401).json({message: "Error in authentication (invalid credentials, etc) "})
        }

        return res.status(500).json({message: "Error happend during authentification which doesn't come from OAuth"})
    }
})

authRouter.get("/checkAuth", validateRequest, (req, res) => {
    if(res.locals.session) {
        return res.status(200).json({message: "Is Connected"})
    }

    return res.status(401).json({message: "Is not connected"})
})

authRouter.get("/logout", validateRequest , async (req, res) => {
    if(!res.locals.session) return res.status(401).json({message: "Already logged out"})

    await lucia.invalidateUserSessions(res.locals.session.id)

    return res.header({
        "Set-Cookie": lucia.createBlankSessionCookie().serialize()
    }).redirect(Deno.env.get("CLIENT_URL")+"/?logout")
})

export default authRouter