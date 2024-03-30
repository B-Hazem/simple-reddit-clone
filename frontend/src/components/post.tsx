import { FaArrowDown, FaArrowUp, FaExclamation, FaTrash, FaBan } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { toast } from "sonner";
import useSWR, { KeyedMutator } from "swr";
import fetcher from "../misc/fetcher";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown";
import { PostInfo } from "./posts";


export default function Post({postInfo, isModerator, mutatePosts} : 
    {postInfo: PostInfo, isModerator: boolean, mutatePosts: KeyedMutator<PostInfo[]>}) {
    
    const location = useLocation()
    
    const {data, mutate} = useSWR<{upVotes: number, downVotes: number}>(`http://localhost:3000/api/votes/${postInfo.id}`, fetcher)

    const handleUpVote = () => {

        fetch("http://localhost:3000/api/votes/up", {
            credentials: "include", method: "POST", 
            body: JSON.stringify({postId: postInfo.id}), 
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
            body: JSON.stringify({postId: postInfo.id}), 
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

    const handleDeletePost = () => {
        fetch("http://localhost:3000/api/posts/delete", {
            credentials: "include", method: "POST",
            body: JSON.stringify({postId: postInfo.id, subreddit: postInfo.subReddit}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) {
                res.json().then(data => toast.error(data.message))
            }
            mutatePosts()
        })
    }

    const handleBanUser = () => {
        fetch("http://localhost:3000/api/subreddits/ban", {
            credentials: "include", method: "POST",
            body: JSON.stringify({username: postInfo.authorName, subreddit: postInfo.subReddit}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) {
                res.json().then(data => toast.error(data.message))
            }
        })
    }

    const handleReport = () => {
        fetch("http://localhost:3000/api/posts/report", {
            credentials: "include", method: "POST",
            body: JSON.stringify({postId: postInfo.id}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) {
                res.json().then(data => toast.error(data.message))
            }
        })
    }

    return (
        <>
            <div className="">
                <div className="flex justify-between gap-5 font-semibold">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-xl">{postInfo.title}</h2>
                        <Link relative="path" to={postInfo.subReddit == location.pathname.split("/")[1] ? "" : postInfo.subReddit} className="font-thin underline">r/{postInfo.subReddit}</Link>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleUpVote()} className="flex flex-row-reverse items-center gap-1"><FaArrowUp />{!data ? '?' : data.upVotes}</button>
                        <button onClick={() => handleDownVote()} className="flex flex-row-reverse items-center gap-1"><FaArrowDown />{!data ? '?' : data.downVotes}</button>
                    </div>
                </div>
                <div className="flex justify-between items-baseline">
                    <p className="font-thin text-sm mb-2">u/{postInfo.authorName}</p>

                    <div className="flex gap-1">
                        {isModerator && postInfo.reportCount ? <p className="flex flex-row-reverse items-center text-red-300"><FaExclamation />{postInfo.reportCount}</p> : ""}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none"><BsThreeDots size="1.5em"/></DropdownMenuTrigger>
                            <DropdownMenuContent className="rounded-xl bg-background">
                                {isModerator 
                                ? <>
                                    <DropdownMenuItem onClick={() => handleDeletePost()} className="rounded-md gap-1.5 text-red-300 focus:bg-red-200/25 align-middle">
                                        <FaTrash />
                                        <p className="">Delete this post</p>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => handleBanUser()} className="rounded-md gap-1.5 text-red-300 focus:bg-red-200/25 align-middle">
                                        <FaBan />
                                        <p className="">Ban the user</p>
                                    </DropdownMenuItem>
                                </>

                                : <DropdownMenuItem onClick={() => handleReport()} className="rounded-md gap-1.5 text-red-300 focus:bg-red-200/25 align-middle">
                                    <FaExclamation />
                                    <p className="">Report to moderator</p>
                                </DropdownMenuItem> }
                                
                                

                                
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mt-6">
                    <p>{postInfo.content}</p>
                </div>
            </div>
        </>
    )
}