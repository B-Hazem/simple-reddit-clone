import { ReactNode, useContext, useEffect, useState } from "react"
import { IsAuthContext } from "../misc/IsAuthContext"

export function IsAuthWrapper({children}: {children: ReactNode}) {
    const authCtx = useContext(IsAuthContext)
    const [isAuth, setIsAuth] = useState(false)

    useEffect(() => {
        if(authCtx == null || authCtx == false) {
            console.log("checking your shit")
            fetch("http://localhost:3000/api/checkAuth", {credentials: "include"})
            .then((res) => {
                console.log(res.status)
                if(res.status == 401) {
                    console.log("not logged in")
                    setIsAuth(false)
                } else {
                    console.log("logged in")
                    setIsAuth(true)
                }
            })
            .catch((err) => {
                console.error(err)
                setIsAuth(false)
            })

        }

    }, [])

    
    return (
        <IsAuthContext.Provider value={isAuth}>
            {children}
        </IsAuthContext.Provider>
    )

}