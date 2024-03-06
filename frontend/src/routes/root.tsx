import { useContext, useState } from "react";
import Posts from "../components/posts";
import "../index.css"
import { FaFireFlameCurved, FaClockRotateLeft  } from "react-icons/fa6";
import { Login } from "../components/login";
import { IsAuthContext } from "../misc/IsAuthContext";
import { SubReddits } from "../components/SubReddits";
import { NewSub } from "../components/new_sub";

export enum MainPageEndPoint {
    Recent = "recent",
    Hot = "hottest",
    AllSubs = ""
}

export default function Root() {
    const [endpoint, setEndpoint] = useState<MainPageEndPoint>(MainPageEndPoint.Recent)
    const isAuthCtx = useContext(IsAuthContext)

    const switchEndpoint = (to: MainPageEndPoint) => {
        setEndpoint(to)
    }


    return (
        <>
            <div className="w-[50vw] mx-auto ">
                <div className="flex flex-row  h-12 items-baseline content-baseline justify-between">
                    <div className="flex gap-4">
                        <button onClick={() => switchEndpoint(MainPageEndPoint.Hot)} className="flex items-baseline gap-2 bg-secondary rounded p-3">
                            <FaFireFlameCurved /> <p className="font-semibold">Hot</p>
                        </button>
                        <button onClick={() => switchEndpoint(MainPageEndPoint.Recent)} className="flex items-baseline gap-2 bg-secondary rounded p-3">
                            <FaClockRotateLeft /> <p className="font-semibold">Recent</p>
                        </button>
                        <button onClick={() => setEndpoint(MainPageEndPoint.AllSubs)} className="flex items-baseline gap-2 bg-secondary rounded p-3"> 
                            <p className="font-semibold">All Subs</p>
                        </button>
                    </div>
                    {isAuthCtx ? <NewSub /> : <Login />}
                </div>
                <div className="mt-8">
                    {endpoint == MainPageEndPoint.AllSubs ? <SubReddits /> : <Posts endpoint={endpoint}/>}
                </div>
            </div>
        
        </>
    )
} 