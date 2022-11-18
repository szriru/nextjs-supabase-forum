import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { ProfileContext } from "../pages/index"
import { Post } from '../utils/database.types'

interface IProps {
    initialPosts: Post[]
    initialError: boolean
}

const Board = ({ initialPosts, initialError }: IProps) => {
    const [posts, setPosts] = useState<Post[] | null>(null)

    useEffect(() => {
        setPosts([...initialPosts])
    }, [initialPosts])

    return (
        <>
            <InputContainer />
            <ul className="container w-full h-full m-4 p-4 border-2 border-slate-400">
                {posts?.map(post => (
                    <li key={post.id} className="inline-flex flex-col w-full gap-y-2 p-2 m-2 border-2 border-slate-200">
                        <div className="flex text-left underline gap-x-2">
                            <p>{post.id}.</p>
                            <p><Link href={`/user/${post.from}`}>{post.from}</Link></p>
                            <p>{post.created_at}</p>
                        </div>
                        <p>{post.content}</p>
                    </li>
                ))}
            </ul>
            {initialError ? (
                <div>
                    Something goes wrong.
                </div>
            ) : null}
        </>
    )
}

const InputContainer = () => {
    const { isLoading, session, error } = useSessionContext()

    return (
        <>
            {session ? (
                <InputField />
            ) : (
                <div className="container w-full m-4 p-4 border-slate-400 border-2">
                    YOU NEED TO LOG IN TO POST A MESSAGE
                </div>
            )}
        </>
    )
}

const InputField = () => {
    const profile = useContext(ProfileContext)
    const supabase = useSupabaseClient()
    const commentRef = useRef<HTMLTextAreaElement | null>(null)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const comment = commentRef?.current!.value
        try {
            let { error } = await supabase
                .from('posts')
                .insert({
                    from: profile.username,
                    content: comment,
                })
        } catch (err) {
            console.log("An error occured when posting a comment")
            alert(err)
        } finally {
            window.location.reload();
        }
    }


    return (
        <>
            {profile.username !== null && profile.username !== "" ? (
                <div className="container w-full m-4 p-4 border-slate-400 border-2">
                    <form onSubmit={handleSubmit}>
                        <div className="relative inline-flex flex-col">
                            <p>post a comment as <a className="bold text-blue-500" href="">{profile.username}</a></p>
                            <textarea
                                className="bg-white rounded-lg border border-black p-2"
                                ref={commentRef}
                                rows={5}
                                cols={60}
                                placeholder="What are your thoughts?"
                            />
                            <button
                                className="text-sm font-bold absolute text-white bottom-2 p-2 shadow-lg right-2 rounded-lg bg-blue-500"
                                type="submit"
                            >
                                COMMENT
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="container w-full m-4 p-4 border-slate-400 border-2">
                    <Link href="/login">
                        <p className="text-bold text-xl animate-bounce text-rose-500">Welcome, you need to set your username first before post a message.</p>
                    </Link>
                </div>
            )}
        </>

    )
}


export default Board