import React, { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Database } from '../utils/database.types'
type Profiles = Database['public']['Tables']['profiles']['Row']
import Image from 'next/image'

export default function Avatar({
    uid,
    url,
    size,
    onUpload,
}: {
    uid: string | undefined
    url: Profiles['avatar_url']
    size: number
    onUpload: (url: string) => void
}) {
    const supabase = useSupabaseClient<Database>()
    const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        async function downloadImage(path: string) {
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
        if (url) downloadImage(url)
    }, [url, supabase])



    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
        event
    ) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]

            if (file.size / (1024 ** 2) > 1) {
                alert("The limit of an image file size is 1MB")
                throw new Error("The limit of an image file size is 1MB")
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${uid}.${fileExt}`
            const filePath = `${fileName}`

            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                throw uploadError
            }

            onUpload(filePath)
        } catch (error) {
            alert('An error occured while uploading an avatar image')
            console.log(error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex justify-around items-center">
            <div className="flex justify-center items-center rounded-lg">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Avatar"
                        className="avatar image"
                        width={size / 3 * 2}
                        height={size / 3 * 2}
                    />
                ) : (
                    <div
                        className="m-4 bg-sky-300 rounded-xl"
                        style={{ height: size / 2, width: size / 2 }}
                    >
                        <h1 className="flex items-center justify-center w-full h-full">Avatar No Image</h1>
                    </div>
                )}
                <div style={{ width: size / 3 }}>
                    <label className="inline-block m-4 rounded-lg bg-sky-200 p-2 border-slate-500 border-2" htmlFor="single">
                        {uploading ? 'Uploading ...' : 'Upload'}
                    </label>
                    <input
                        style={{
                            visibility: 'hidden',
                            position: 'absolute',
                        }}
                        type="file"
                        id="single"
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={uploading}
                    />
                </div>
            </div>
        </div>
    )
}