import { useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import fetcher, { fetcherWithCookie } from "../misc/fetcher"
import { useParams } from "react-router-dom"
import Posts from "../components/posts"
import { toast } from "sonner"
import { TiDeleteOutline } from "react-icons/ti";
import { FaUnlock } from "react-icons/fa6";


export default function SubRedditAdminRoute() {
    const {subRedditName} = useParams()
    const {data} = useSWR<{result: boolean}>(`http://localhost:3000/api/users/-1/moderator/${subRedditName}`, fetcherWithCookie)
    const {data: bannedUsers, mutate: mutateBannedUsers} = useSWR<{username: string, userId: string}[]>(`http://localhost:3000/api/subreddits/ban/${subRedditName}`, fetcherWithCookie)
    const {data: moderators, mutate: mutateModerators} = useSWR<{username: string, userId: string}[]>(`http://localhost:3000/api/subreddits/${subRedditName}/moderators`, fetcher)

    const [userId, setUserId] = useState("")


    const handleAddModerator = () => {
        console.log(userId)
        if(userId == "") return toast.error("No user id")

        fetch(`http://localhost:3000/api/users/${userId}/moderator`, {
            credentials: "include", 
            body: JSON.stringify({subreddit: subRedditName}),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
                if(!res.ok) return res.json().then(data => toast.error(data.message))
                res.json().then(data => toast.success(data.message))
                mutateModerators()
            })
    }

    const handleRemoveModerator = (_userId: string) => {
        fetch(`http://localhost:3000/api/users/${_userId}/moderator`, {
            credentials: "include", 
            body: JSON.stringify({subreddit: subRedditName}),
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) return res.json().then(data => toast.error(data.message))
            res.json().then(data => toast.success(data.message))
            mutateModerators()
        })
    }

    const handleUnban = (_userId: string) => {
        fetch(`http://localhost:3000/api/users/${_userId}/unban`, {
            credentials: "include", 
            body: JSON.stringify({subreddit: subRedditName}),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) return res.json().then(data => toast.error(data.message))
            res.json().then(data => toast.success(data.message))
            mutateBannedUsers()
        })
    }

    const handleBan = () => {
        fetch(`http://localhost:3000/api/users/${userId}/ban`, {
            credentials: "include", 
            body: JSON.stringify({subreddit: subRedditName}),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) return res.json().then(data => toast.error(data.message))
            res.json().then(data => toast.success(data.message))
            mutateBannedUsers()
            mutateModerators()
        })
    }

    return <>
        {data?.result ? <>
            <div className="w-[50vw] mx-auto">
                <div className="">
                    <h1 className="text-xl font-bold mb-4">Moderator</h1>
                    
                    
                    <div className="flex mb-4 gap-3 items-baseline">
                        <input onChange={(e) => setUserId(e.currentTarget.value)} placeholder="Put the UserID here" autoComplete="off" className="rounded border-primary/30 focus:border-primary transition-all outline-none border-2 bg-black/30 px-4 py-2 " type="text" />
                        <button onClick={() => handleAddModerator()} className=" rounded bg-primary text-black p-2">Add as moderator</button>
                    </div>
                    {/* <hr className="w-56 mx-auto my-10" /> */}
                    <div>
                        <div className="w-[75%] mx-auto">
                            {moderators?.map((mod) => (<div className="flex gap-2 items-center">
                                <div className="flex items-baseline gap-2">
                                    <p>*</p>
                                    <p className="text-lg">{mod.username}</p> 
                                    <p>-</p>
                                    <p className="italic">{mod.userId}</p>
                                </div>
                                <button onClick={() => handleRemoveModerator(mod.userId)} title="Remove moderator status"><TiDeleteOutline  className="text-red-500" size={24} /></button>
                            </div>))}
                        </div>
                    </div>
                </div>

                <hr className="my-10" />

                <div>
                    <h1 className="text-xl font-bold mb-4">Reported posts</h1>
                    <div className="w-[75%] mx-auto">
                        <Posts endpoint={`report/${subRedditName}`} isModerator={data.result} />
                    </div>
                </div>
                
                <hr className="my-10" />
                
                <div>
                    <h1 className="text-xl font-bold mb-4">Banned users</h1>
                    <div className="flex mb-4 gap-3 items-baseline">
                        <input onChange={(e) => setUserId(e.currentTarget.value)} placeholder="Put the UserID here" autoComplete="off" className="rounded border-primary/30 focus:border-primary transition-all outline-none border-2 bg-black/30 px-4 py-2 " type="text" />
                        <button onClick={() => handleBan()} className=" rounded bg-primary text-black p-2">Ban user</button>
                    </div>
                    <div className="w-[75%] mx-auto">
                        {bannedUsers?.map((bannedUser) => (<div className="flex gap-2 items-center" >
                            <div className="flex gap-2 items-baseline">
                                <p>*</p>
                                <p className="text-lg">{bannedUser.username}</p>
                                <p>-</p>
                                <p className="italic">{bannedUser.userId}</p>
                            </div>
                            <button onClick={() => handleUnban(bannedUser.userId)} title="Unban user"><FaUnlock className="p-0.5 text-green-500" size={24} /></button>
                        </div>))}
                    </div>
                </div>

            </div>
        
        
        </> : <p>Not an admin</p>}
    
    
    </>
        
    
}