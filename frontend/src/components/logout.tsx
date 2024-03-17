import { toast } from "sonner"

export function Logout() {

    return (
        <a href="http://localhost:3000/api/logout" className="bg-primary rounded p-3 text-black">Logout</a>
    )
}