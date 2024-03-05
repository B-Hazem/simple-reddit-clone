import { Link } from "react-router-dom"
import { redirect, useNavigate } from "react-router-dom"

export function Login() {

    return (
        <a className="rounded bg-primary text-black p-2" href='http://localhost:3000/api/login/github/'>Login</a>
    )

}