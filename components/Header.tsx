import { useSession } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import { useContext } from 'react'
import JSXStyle from 'styled-jsx/style'
import { ProfileContext } from "../pages/index"
import Image from "next/image"

export const Header = () => {
    const session = useSession()
    const profile = useContext(ProfileContext)

    return (
        <div className="flex justify-center items-center my-2 w-full h-[80px]  border-b-4 border-slate-400">
            <div className="flex justify-around items-center w-full">
                <div>
                    <h1 className="font-bold italic text-3xl"><Link href="/">Random Forum</Link></h1>
                    {/* <button onClick={() => console.log({profile})}>STATE CHECK</button> */}
                </div>
                {/* <div>
                    <input type="text" placeholder="search" className="p-2 border-slate-200 border-2 rounded-2xl" />
                </div> */}
                <div className="border-slate-400 bg- border-2 rounded-xl p-2">
                    <Link href="/login">
                        {(session && profile) ? (
                            <div className="flex space-x-2 justify-center items-center ">
                                <AvatarImage avatarUrl={profile.avatarUrl} />
                                <p>{profile.username}</p>
                            </div>
                        ) : (
                            <h1>+ Login</h1>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    )
}

const AvatarImage = ({ avatarUrl }: { avatarUrl: string | null }) => {
    return (
        <>
            {avatarUrl === null || avatarUrl === "" ? (
                <Image
                    src="/assets/compressedHedgehog.jpg"
                    alt="avatar image"
                    width={40}
                    height={40}
                    className="object-cover"
                />
            ) : (
                <Image
                    src={avatarUrl as string}
                    alt="avatar image"
                    width={40}
                    height={40}
                    className="object-cover"
                />
            )}
        </>
    )
}

export default Header