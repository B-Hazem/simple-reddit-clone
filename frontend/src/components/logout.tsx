import { SERVER_URL } from "../main";


export function Logout() {

    return (
        <a href={SERVER_URL + "/api/logout"} className="bg-primary rounded p-3 text-black">Logout</a>
    )
}