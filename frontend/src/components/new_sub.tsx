import { useState } from "react"
import { DialogHeader, DialogFooter, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "./dialog"
import { Input } from "./input"
import { Label } from "./label"
import { toast } from "sonner"
import { mutate } from "swr"
import { SERVER_URL } from "../main"


export function NewSub() {
    const [newName, setNewTitle] = useState<string>("")
    const [newDescription, setNewDescription] = useState<string>("")

    const handleSubmit = () => {
        if(newName.trim() == "" || newDescription.trim() == "") {
            return toast.error("You can't create a subreddit with empty title or description :/ ")
        }

        if(newName.includes(' ')) {
            return toast.error("You can't use spaces in names of a subreddit :/ ")
        }

        fetch(SERVER_URL + "/api/subreddits/",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                newName: newName,
                newDescription: newDescription,
            }),
            credentials: "include",
        }).then((res) => {
            if(res.status >= 400) {
                res.json().then(data => toast.error(data.message))
                return
            }

            mutate(SERVER_URL + "/api/subreddits/")
            res.json().then(data => toast.success(data.message))
        })
    }

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <button className="bg-primary text-background rounded p-3">Create a subreddit</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a new subreddit</DialogTitle>
                        <DialogDescription>What you want people to talk about ?</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input onChange={(e) => setNewTitle(e.target.value)} id="title" type="text"></Input>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input onChange={(e) => setNewDescription(e.target.value)} id="description" type="text"></Input>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <button onClick={() => handleSubmit()}>Publish</button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}