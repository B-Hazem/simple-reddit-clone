import { ReactNode, useEffect, useState } from "react"
import { IsAuthContext } from "../misc/IsAuthContext"
import { SERVER_URL } from "../main"


export function IsAuthWrapper({children}: {children: ReactNode}) {
    const [isAuth, setIsAuth] = useState(false)

    // const searchParams = new URL(document.location as any).searchParams

    useEffect(() => {
        fetch(SERVER_URL + "/api/checkAuth", {credentials: "include", cache: "no-cache"})
        .then((res) => {
            console.log(res.status)
            if(res.status == 401) {
                setIsAuth(false)
            } else {
                setIsAuth(true)
            }
        })
        .catch((err) => {
            console.error(err)
            setIsAuth(false)
        })


    }, [])

    
    return (
        <IsAuthContext.Provider value={isAuth}>
            {children}
        </IsAuthContext.Provider>
    )

}