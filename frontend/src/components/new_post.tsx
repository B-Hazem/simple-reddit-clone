import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "../components/dialog"
import { Label } from "../components/label";
import { Input } from "../components/input";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";


export function NewPost({subReddit} : {subReddit: string}) {
    const [newTitle, setNewTitle] = useState<string>("")
    const [newContent, setNewContent] = useState<string>("")


    const handleSubmit = () => {
        if(newTitle.trim().length == 0 || newContent.trim().length == 0) {
            toast.error("The title and/or the content of your post is empty")
            return
        }

        fetch("http://localhost:3000/api/posts/",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                newTitle: newTitle,
                newContent: newContent,
                subreddit: subReddit
            }),
            credentials: "include",
            
        }).then((e) => {
            console.log("something")
            if(e.status == 200) {
                mutate(`http://localhost:3000/api/posts/${subReddit}`)
                toast.success("You new post has been added")
            } else {
                e.json().then((v) => {
                    toast.error(v.message)
                })
            }
        })
        .catch(e => console.error(e))
    }

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <button className="bg-primary text-sm text-background rounded p-3 min-w-28 h-12">Create a post</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a new post!</DialogTitle>
                        <DialogDescription>Share your thoughts with likeminded people ;)</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input onChange={(e) => setNewTitle(e.target.value)} id="title" type="text"></Input>
                        </div>

                        <div>
                            <Label htmlFor="content">Content</Label>
                            <Input onChange={(e) => setNewContent(e.target.value)} id="content" type="text"></Input>
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