import { useState } from "react"
import { useParams } from "react-router-dom"
import useSWR from "swr"
import { PostInfo } from "../components/posts"
import fetcher from "../misc/fetcher"
import Post from "../components/post"

export function UserRoute() {
    const {userId} = useParams()
    const [subPage, setSubPage] = useState(true)
    const {data: postsData, mutate: mutatePost} = useSWR<PostInfo[]>(`http://localhost:3000/api/posts/byAuthor/${userId}`, fetcher)
    const {data: upVotesData} = useSWR<PostInfo[]>(`http://localhost:3000/api/votes/up/${userId}`, fetcher)


    return <>
        <div className="w-[95vw] lg:w-[50vw] mx-auto mt-4">
            <div className="flex justify-between items-baseline">
                <h1 className="text-xl font-bold">B-Hazem</h1>
                <div className="flex gap-4">
                    <button onClick={() => setSubPage(true)}
                     aria-selected={subPage} className="flex items-baseline gap-2 bg-secondary aria-selected:bg-primary/80 rounded p-3">Latests posts</button>
                    <button onClick={() => setSubPage(false)} 
                    aria-selected={!subPage} className="flex items-baseline gap-2 bg-secondary aria-selected:bg-primary/80 rounded p-3">Upvoted posts</button>

                </div>
            </div>
            
            <hr  className="my-6"/>

            <div className="w-[90%] mx-auto">
                {subPage ? <>
                    {postsData?.map(post => <>
                    <Post postInfo={post} isModerator={false} mutatePosts={mutatePost} />
                    <hr className="my-6 w-[75%] mx-auto"/>
                </>)}
                </> 
                : <>
                {upVotesData?.map(post => <>
                    <Post postInfo={post} isModerator={false} mutatePosts={mutatePost} />
                    <hr className="my-6 w-[75%] mx-auto"/>
                </>)}
                </>}
                
            </div>


        </div>

    </>
}