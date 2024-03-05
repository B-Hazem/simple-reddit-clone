import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";


export default function Post({title, content, upVotes, downVotes, subReddit} : 
    {title: string, content: string, upVotes: number, downVotes: number, subReddit: string}) {
    
    const location = useLocation()

    return (
        <>
            <div className="">
                <div className="flex justify-between font-semibold mb-2">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-xl">{title}</h2>
                        <Link relative="path" to={subReddit == location.pathname.split("/")[1] ? "" : subReddit} className="font-thin">r/{subReddit}</Link>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex flex-row-reverse items-center gap-1"><FaArrowUp />{upVotes}</button>
                        <button className="flex flex-row-reverse items-center gap-1"><FaArrowDown />{downVotes}</button>
                    </div>
                </div>
                <div>
                    <p>{content}</p>
                </div>
            </div>
        </>
    )
}