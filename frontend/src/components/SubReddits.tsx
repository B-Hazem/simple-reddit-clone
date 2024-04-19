import useSWR from "swr"
import fetcher, { fetcherWithCookie } from "../misc/fetcher"
import { SubRedditInfo } from "../routes/subredditRoute"
import { Link } from "react-router-dom"
import { MainPageEndPoint } from "../routes/root"
import { SERVER_URL } from "../main"

export function SubReddits({endpoint}: {endpoint: MainPageEndPoint}) {
    const {data} = useSWR<SubRedditInfo[]>(() => {
        if(endpoint == MainPageEndPoint.AllSubs) return SERVER_URL + "/api/subreddits"
        if(endpoint == MainPageEndPoint.FollowedSubs) return SERVER_URL + "/api/subreddits/follow"
    }, fetcherWithCookie)


    return (<>
        {data?.map((sub) => <>
            <Link to={sub.name} className="flex gap-2 items-baseline flex-wrap">
                <h1 className="text-2xl font-semibold">{sub.name}</h1>
                <p className="font-thin">{sub.description}</p>
            </Link>
            <hr className="my-2"/>
        </>)}
    </>)
}