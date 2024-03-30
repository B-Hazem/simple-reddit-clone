import { useContext } from "react";
import { useParams } from "react-router-dom";
import Posts from "../components/posts";
import { NewPost } from "../components/new_post";
import useSWR from "swr";
import fetcher, { fetcherWithCookie } from "../misc/fetcher";
import { IsAuthContext } from "../misc/IsAuthContext";
import { Login } from "../components/login";
import { Link } from "react-router-dom";


export type SubRedditInfo = {
    name: string,
    description: string,
    createdAt: string
}

export function SubRedditRoute() {
    const {subRedditName} = useParams()
    const {data, isLoading} = useSWR<SubRedditInfo>(`http://localhost:3000/api/subreddits/${subRedditName}`, fetcher)
    const isModerator = useSWR<{result: boolean}>(`http://localhost:3000/api/users/-1/moderator/${subRedditName}`, fetcherWithCookie)

    const isAuth = useContext(IsAuthContext)

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
                            {isAuth ? <NewPost subReddit={subRedditName!}/> : <Login /> }
                        </div>
                        
                        
                    </> 
                    )
                    : 
                    (<div></div>)
                    }  
                    
                </div>
                <div className="mt-8">
                    <Posts endpoint={subRedditName!} isModerator={isModerator.data?.result!} />
                </div>
            </div>
        </>
    )
}