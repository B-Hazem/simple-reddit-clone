import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { db } from "../db/db.ts";
import { sessionTable, userTable } from "../db/schema.ts";
import { GitHub } from "arctic";
import { parseCookies } from "npm:oslo@^1.1.2/cookie";

// @deno-types="npm:@types/express@4.17.21"
import {Request, Response, NextFunction} from "npm:express"

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable)

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: Deno.env.get("ENV") === "production",
        }
    },
    getUserAttributes: (attributes) => {
        return {
            githubId: attributes.githubId,
            username: attributes.username,
        }
    }   
})

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia
        DatabaseUserAttributes: {
            githubId: number,
            username: string
        }
    }
}

export const github = new GitHub(Deno.env.get("GITHUB_CLIENT_ID")!, Deno.env.get("GITHUB_SECRET")!)


export const validateRequest = async (req: Request, res: Response, next: NextFunction) => {
    
    const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "")!
    
    if(!sessionId) {
        console.log(sessionId)
        res.locals.user =  null,
        res.locals.session = null
        return next()
    }

    const result = await lucia.validateSession(sessionId)

    if(result.session && result.session.fresh) {
        res.header("Set-Cookie", lucia.createSessionCookie(result.session.id).serialize())
    }
    if(!result.session) {
        res.header("Set-Cookie", lucia.createBlankSessionCookie().serialize())
    }

    res.locals.user = result.user
    res.locals.session = result.session

    return next()
}