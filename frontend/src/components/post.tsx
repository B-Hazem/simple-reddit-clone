import { FaArrowDown, FaArrowUp, FaExclamation, FaTrash, FaBan } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { toast } from "sonner";
import useSWR, { KeyedMutator } from "swr";
import fetcher from "../misc/fetcher";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown";
import { PostInfo } from "./posts";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { SERVER_URL } from "../main";


export default function Post({postInfo, isModerator, mutatePosts} : 
    {postInfo: PostInfo, isModerator: boolean, mutatePosts: KeyedMutator<PostInfo[]> | null}) {
    
    const location = useLocation()
    
    const {data, mutate} = useSWR<{upVotes: number, downVotes: number}>(`${SERVER_URL}/api/votes/${postInfo.id}`, fetcher)

    const {data: authorId, isLoading: isAuthorIdLoading} = useSWR<{userId: string}>(`${SERVER_URL}/api/users/getId/${postInfo.authorName}`, fetcher)
    
    const handleUpVote = () => {

        fetch(SERVER_URL + "/api/votes/up", {
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
        fetch(SERVER_URL + "/api/votes/down", {
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
        fetch(SERVER_URL + "/api/posts/delete", {
            credentials: "include", method: "POST",
            body: JSON.stringify({postId: postInfo.id, subreddit: postInfo.subReddit}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) {
                res.json().then(data => toast.error(data.message))
            }
            mutatePosts!()
        })
    }

    const handleBanUser = () => {
        fetch(SERVER_URL + "/api/subreddits/ban", {
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
        fetch(SERVER_URL + "/api/posts/report", {
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
                        <Link to={`/post/${postInfo.id}`} className="text-xl">{postInfo.title}</Link>
                        <Link to={`/${postInfo.subReddit}`} className="font-thin underline">r/{postInfo.subReddit}</Link>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleUpVote()} className="flex flex-row-reverse items-center gap-1"><FaArrowUp />{!data ? '?' : data.upVotes}</button>
                        <button onClick={() => handleDownVote()} className="flex flex-row-reverse items-center gap-1"><FaArrowDown />{!data ? '?' : data.downVotes}</button>
                    </div>
                </div>
                <div className="flex justify-between items-baseline">
                    {isAuthorIdLoading ? <AiOutlineLoading3Quarters className="animate-spin h-auto"/>
                    : <Link to={`/user/${authorId?.userId}`} className="font-thin italic underline  text-sm mb-2">u/{postInfo.authorName}</Link> 
                    }


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