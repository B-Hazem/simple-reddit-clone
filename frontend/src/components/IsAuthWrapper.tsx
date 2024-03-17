import { ReactNode, useEffect, useState } from "react"
import { IsAuthContext } from "../misc/IsAuthContext"

export function IsAuthWrapper({children}: {children: ReactNode}) {
    const [isAuth, setIsAuth] = useState(false)

    const searchParams = new URL(document.location as any).searchParams

    useEffect(() => {
        if(searchParams.has("login") || searchParams.has("logout")) {
            console.log("checking your shit")
            fetch("http://localhost:3000/api/checkAuth", {credentials: "include", cache: "no-cache"})
            .then((res) => {
                console.log(res.status)
                if(res.status == 401) {
                    localStorage.removeItem("isLoggedIn")
                    setIsAuth(false)
                } else {
                    localStorage.setItem("isLoggedIn", "true")
                    setIsAuth(true)
                }
            })
            .catch((err) => {
                console.error(err)
                localStorage.removeItem("isLoggedIn")
                setIsAuth(false)
            })
        }

        console.log(localStorage.getItem("isLoggedIn"))
        setIsAuth(localStorage.getItem("isLoggedIn") ? true : false)

    }, [])

    
    return (
        <IsAuthContext.Provider value={isAuth}>
            {children}
        </IsAuthContext.Provider>
    )

}