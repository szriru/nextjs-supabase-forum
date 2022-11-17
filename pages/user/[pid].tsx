import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Header from '../../components/Header'

type Profile = Database['public']['Tables']['profiles']['Row']


const User = () => {
    const router = useRouter()
    const { pid } = router.query
    const supabase = useSupabaseClient()
    const [userProfile, setUserProfile] = useState(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!pid) return
        getUserProfile()
    }, [pid])

    const getUserProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select("username, avatar_url, website")
                .eq('username', pid)
                .single()
            if (data) {
                setUserProfile<Profile>(data)
                downloadImage<string | null>(data.avatar_url)
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

    return (
        <div className="bg-slate-100 flex flex-col justify-center items-center w-full">
            <Header />
            <div className="container w-full h-full ">
                <div className="text-xl m-2 border border-slate-200 w-full flex flex-col justify-center items-center">
                    <h1 className="text-3xl m-2">{userProfile?.username}'s Profile Page</h1>
                    <div className="gap-y-4 border border-slate-400 p-4 rounded-lg ">
                        <p>Username: {userProfile?.username}</p>
                        <p>Avatar: <img src={avatarUrl} className="object-contain w-[200px] h-[200px]" /></p>
                        <p>User Website: {userProfile?.website} </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default User