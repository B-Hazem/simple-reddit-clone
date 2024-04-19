import { useParams } from "react-router-dom"
import useSWR from "swr"
import { PostInfo } from "../components/posts"
import Post from "../components/post"
import fetcher, { fetcherWithCookie } from "../misc/fetcher"
import { useState } from "react"
import { toast } from "sonner"
import { BsThreeDots } from "react-icons/bs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown"
import { SERVER_URL } from "../main"



export function PostRoute() {
    const {postId} = useParams()
    
    const {data: postInfo, isLoading: postInfoIsLoading} = useSWR<PostInfo[]>(`${SERVER_URL}/api/posts/single/${postId}`, fetcher)
    const {data: comments, mutate: mutateComments} = useSWR<{id: number,comment: string, username: string, createdAt: string}[]>(`${SERVER_URL}/api/posts/comment/${postId}`, fetcher)
    const {data: isModerator} = useSWR<{result: boolean}>(() => SERVER_URL + "/api/users/moderator/-1" + postInfo![0].subReddit, fetcherWithCookie );


    const [comment, setComment] = useState("")
    
    const handleAddComment = () => {
        fetch(SERVER_URL + "/api/posts/comment/", {
            credentials: "include", method: "POST", 
            body: JSON.stringify({postId: +postId!, comment: comment}), 
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(res.status >= 400) {
                res.json().then(data => toast.error(data.message))
                return
            }
            mutateComments()
        })
    }

    const handleDeleteComment = (commentId: number) => {
        fetch(SERVER_URL + "/api/posts/comment", {
            credentials: "include", method: "DELETE",
            body: JSON.stringify({commentId: commentId}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) {
                res.json().then(data => toast.error(data.message))
                return
            }
            mutateComments()
        })
    }

    return (<>
        {postInfoIsLoading ? <p>Loading</p> : 
        <div className="w-[95vw] lg:w-[50vw] mx-auto mt-4">
            <Post isModerator={false} mutatePosts={null} postInfo={postInfo![0]}/>
            
            <hr className="my-8" />
            
            <h3 className="font-bold mb-2">Comments:</h3>
            <div className="w-[75%] mx-auto">
                <div className="w-full mx-auto flex gap-4 items-center mb-4">
                    <textarea onChange={(e) => setComment(e.currentTarget.value)} rows={2} className="resize-y rounded w-full h-fit border-primary/30 focus:border-primary transition-colors outline-none border-2 bg-black/30 px-4 py-2 "></textarea>
                    <button onClick={() => handleAddComment()}>Add comment</button>
                </div>
                {comments?.map(comment => (<>
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex justify-between">
                            <p>{comment.username} • <span className="italic text-sm">{comment.createdAt}</span></p>
                            {
                                isModerator?.result ? <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="outline-none"><BsThreeDots/></DropdownMenuTrigger>
                                    <DropdownMenuContent className="rounded-xl bg-background">
                                        <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)} className="rounded-md gap-1.5 text-red-300 focus:bg-red-200/25 align-middle">
                                            <p className="">Delete this comment</p>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>    
                                </> : <></>
                            }
                            
                            
                        </div>
                        <div className="border-l">
                            <p className="w-[90%] mx-auto whitespace-pre">{comment.comment}</p>
                        </div>
                </div>
                </>))}
                
            </div>
        </div>
        }
        
    </>)
}