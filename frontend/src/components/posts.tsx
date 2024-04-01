import Post from "./post";
import { MainPageEndPoint } from "../routes/root";
import useSWR from "swr";
import fetcher from "../misc/fetcher";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

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

export default function Posts({endpoint, isModerator}: {endpoint: MainPageEndPoint | string, isModerator: boolean}) {
    // const [posts, setPosts] = useState<Array<PostInfo>>()
    
    const {data, isLoading, mutate} = useSWR<PostInfo[]>(`http://localhost:3000/api/posts/${endpoint}`, fetcher)


    if (isLoading) return <div className="absolute w-fit top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
        <AiOutlineLoading3Quarters className="animate-spin w-16 h-auto"/>
    </div>

    return (<>
        {data?.map((p: any) => (
        <>
            <Post key={p.id} postInfo={p} isModerator={isModerator} mutatePosts={mutate} />            
            <hr className="my-4" />
        </>
        ))}
    </>)
}