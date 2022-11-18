import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Header from '../../components/Header'

import { Database } from '../../utils/database.types'
import { profile } from 'console'
import Image from "next/image"

type Profile = Database['public']['Tables']['profiles']['Row']


const User = () => {
    const router = useRouter()
    const { pid } = router.query
    const supabase = useSupabaseClient()
    const [userProfile, setUserProfile] = useState<Profile | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!pid) return
        const userName = decodeURI(pid as string)
        console.log(userName)
        const getUserProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select("username, avatar_url, website")
                    .eq('username', userName)
                    .single()
                if (data) {
                    console.log({data})
                    setUserProfile(data as Profile)
                    downloadImage(data.avatar_url)
                }
            } catch (err) {
                throw err
            }
        }

        const downloadImage = async (path: string) => {
            try {
                const { data, error } = await supabase.storage
                    .from('avatars')
                    .download(path)
                if (error) {
                    throw error
                }
                const url = URL.createObjectURL(data)
                setAvatarUrl(url)
            } catch (error) {
                console.log('Error downloading image: ', error)
            }
        }
        getUserProfile()
    }, [pid, supabase])

    useEffect(() => {
        console.log({ userProfile })
    }, [userProfile])

    return (
        <div className="bg-slate-100 flex flex-col justify-center items-center w-full">
            <Header />
            <div className="container w-full h-full ">
                <div className="text-xl m-2 border border-slate-200 w-full flex flex-col justify-center items-center">
                    <h1 className="text-3xl m-2">{userProfile?.username}&apos;s Profile Page</h1>
                    <div className="gap-y-4 border border-slate-400 p-4 rounded-lg ">
                        <p>Username: {userProfile?.username}</p>
                        {
                            userProfile?.avatar_url === null || userProfile?.avatar_url === "" ? (
                                <p> Avatar:
                                    <Image
                                        src="/assets/compressedHedgehog.jpg"
                                        alt="avatar image"
                                        width={200}
                                        height={200}
                                        className="object-cover"
                                    />
                                </p>
                            ) : (
                                <p> Avatar:
                                    <Image
                                        src={avatarUrl || ""}
                                        alt="avatar image"
                                        width={200}
                                        height={200}
                                        className="object-cover"
                                    />
                                </p>
                            )
                        }
                        <p>User Website: {userProfile?.website} </p>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default User