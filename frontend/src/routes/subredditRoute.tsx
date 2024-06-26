import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import Posts from "../components/posts";
import { NewPost } from "../components/new_post";
import useSWR from "swr";
import fetcher, { fetcherWithCookie } from "../misc/fetcher";
import { IsAuthContext } from "../misc/IsAuthContext";
import { Login } from "../components/login";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SERVER_URL } from "../main";

export const POSTS_LIMIT = 5

export type SubRedditInfo = {
    name: string,
    description: string,
    createdAt: string,
    nbPost: number
}

export function SubRedditRoute() {
    const {subRedditName} = useParams()
    const {data, isLoading} = useSWR<SubRedditInfo>(`${SERVER_URL}/api/subreddits/info/${subRedditName}`, fetcher)
    const isModerator = useSWR<{result: boolean}>(`${SERVER_URL}/api/users/moderator/-1/${subRedditName}`, fetcherWithCookie)
    const {data: isFollowing, mutate: mutateIsFollowing} = useSWR<{result: boolean}>(`${SERVER_URL}/api/subreddits/follow/${subRedditName}`, fetcherWithCookie)
    
    const isAuth = useContext(IsAuthContext)

    const [pages, setPages] = useState(0)

    const handleFollow = () => {
        fetch(SERVER_URL + "/api/subreddits/follow", {
            credentials: "include", method: "POST",
            body: JSON.stringify({subreddit: subRedditName}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) {
                res.json().then(data => toast.error(data.message))
                return
            }
            res.json().then(data => toast.success(data.message))

            mutateIsFollowing()
        })
    }

    const handleUnfollow = () => {
        fetch(SERVER_URL + "/api/subreddits/follow", {
            credentials: "include", method: "DELETE",
            body: JSON.stringify({subreddit: subRedditName}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if(!res.ok) {
                res.json().then(data => toast.error(data.message))
                return
            }
            res.json().then(data => toast.success(data.message))

            mutateIsFollowing()
        })
    }

    return (
        <>
            <div className="w-[50vw] mx-auto">
                <div className="flex items-baseline justify-between w-[100%] h-12">
                    {!isLoading ? 
                    (
                    <>
                        <div className="flex items-baseline flex-row gap-4 h-12 mb-2">
                            <h1 className="font-extrabold text-2xl">{data?.name}</h1>
                            <p className="font-thin break-words w-[100%]">{data?.description}</p>
                        </div>
                        
                        <div className="flex gap-4 items-baseline">
                            {isModerator.data?.result ? <Link to={`/${subRedditName}/admin`}>Admin</Link> : <></>}

                            {
                                isAuth ? <>
                                    {isFollowing?.result == true ? 
                                    <button onClick={() => handleUnfollow()} className="flex items-baseline gap-2 bg-secondary rounded p-3">Unfollow</button>
                                    : <button onClick={() => handleFollow()} className="flex items-baseline gap-2 bg-secondary rounded p-3">Follow</button>}
                                </> : <></>
                            }                            
                            
                            {isAuth ? <NewPost subReddit={subRedditName!}/> : <Login /> }                                

                        </div>
                        
                        
                    </> 
                    )
                    : 
                    (<div></div>)
                    }  
                    
                </div>
                <div className="mt-8">
                    <Posts endpoint={subRedditName!} isModerator={isModerator.data?.result!} limit={POSTS_LIMIT} pages={pages} />
                </div>
                
                {
                    isLoading ? <></>
                    : <div className="flex gap-4 justify-center">
                    {[...Array(Math.ceil(data?.nbPost! / POSTS_LIMIT))].map((x, i) => {
                        return <button 
                        key={i}
                        onClick={() => setPages(i)}
                        className={`${pages == i ? 'bg-primary' : 'bg-secondary'} rounded-full w-6 h-auto `}>{i+1}</button>
                    })}
                </div>
                }
                
            </div>
        </>
    )
}