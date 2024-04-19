import Post from "./post";
import { MainPageEndPoint } from "../routes/root";
import useSWR from "swr";
import fetcher, { fetcherWithCookie } from "../misc/fetcher";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { SERVER_URL } from "../main";

export type PostInfo = {
    id: number,
    title: string,
    content: string,
    subReddit: string,
    upVotes: number,
    downVotes: number,
    authorName: string,
    reportCount: number
}

//TODO: Fix loading transition
export default function Posts({endpoint, isModerator, limit, pages}: 
    {endpoint: MainPageEndPoint | string, isModerator: boolean, limit: number | undefined, pages: number | undefined}) {
    // const [posts, setPosts] = useState<Array<PostInfo>>()
    1
    const {data, isLoading, mutate} = useSWR<PostInfo[]>(() => {
        if(endpoint == MainPageEndPoint.Recent || endpoint == MainPageEndPoint.Recent) {
            return `${SERVER_URL}/api/posts/${endpoint}?limit=${20}&pages=${0}`
        } else if(endpoint.toString().includes("/")) {
            return `${SERVER_URL}/api/posts/${endpoint}?limit=${limit}&pages=${pages}`
        } 
        else {
            return `${SERVER_URL}/api/posts/fromSubreddit/${endpoint}?limit=${limit}&pages=${pages}`
        }
    }, fetcherWithCookie)


    if (isLoading) return <div className="absolute w-fit top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
        <AiOutlineLoading3Quarters className="animate-spin w-16 h-auto"/>
    </div>

    return (<>
        {data?.map((p: any) => (
        <>
            <Post key={p.id} postInfo={p} isModerator={isModerator} mutatePosts={mutate} />            
            <hr key={p.id*10} className="my-4" />
        </>
        ))}
    </>)
}