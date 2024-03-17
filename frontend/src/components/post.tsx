import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import useSWR from "swr";
import fetcher from "../misc/fetcher";


export default function Post({title, content, subReddit, id, authorName} : 
    {title: string, content: string, subReddit: string, id: number, authorName: string}) {
    
    const location = useLocation()
    
    const {data, mutate} = useSWR<{upVotes: number, downVotes: number}>("http://localhost:3000/api/votes/1", fetcher)

    const handleUpVote = () => {
        fetch("http://localhost:3000/api/votes/up", {
            credentials: "include", method: "POST", 
            body: JSON.stringify({postId: id}), 
            headers: {
            "Content-Type": "application/json"
            }
        }).then((res) => {
            if(res.status >= 400) {
                res.json().then(data => toast.error(data.message))
                return
            }
            mutate()
        })
    }

    const handleDownVote = () => {
        fetch("http://localhost:3000/api/votes/down", {
            credentials: "include", method: "POST", 
            body: JSON.stringify({postId: id}), 
            headers: {
            "Content-Type": "application/json"
            }
        }).then((res) => {
                if(res.status >= 400) {
                    res.json().then(data => toast.error(data.message))
                    return
                }
                mutate()
            })
    }

    return (
        <>
            <div className="">
                <div className="flex justify-between gap-5 font-semibold">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-xl">{title}</h2>
                        <Link relative="path" to={subReddit == location.pathname.split("/")[1] ? "" : subReddit} className="font-thin underline">r/{subReddit}</Link>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleUpVote()} className="flex flex-row-reverse items-center gap-1"><FaArrowUp />{!data ? '?' : data.upVotes}</button>
                        <button onClick={() => handleDownVote()} className="flex flex-row-reverse items-center gap-1"><FaArrowDown />{!data ? '?' : data.downVotes}</button>
                    </div>
                </div>
                <p className="font-thin text-sm mb-2">u/{authorName}</p>
                <div className="mt-6">
                    <p>{content}</p>
                </div>
            </div>
        </>
    )
}