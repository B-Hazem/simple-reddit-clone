import useSWR from "swr"
import fetcher from "../misc/fetcher"
import { SubRedditInfo } from "../routes/subredditRoute"
import { Link } from "react-router-dom"

export function SubReddits() {
    const {data} = useSWR<SubRedditInfo[]>("http://localhost:3000/api/subreddits/", fetcher)

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