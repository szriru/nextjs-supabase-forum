import { useSessionContext, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useState, useEffect, createContext, useTransition, Dispatch, SetStateAction } from 'react'
import Header from '../components/Header'
import Board from '../components/Board'

import { createClient } from '@supabase/supabase-js'
import { Database, Post } from '../utils/database.types'

type Profiles = Database['public']['Tables']['profiles']['Row']

interface IProps {
  initialPosts: Post[]
  initialError: boolean
}

interface ProfileContextInterface {
  username: string | null
  setUsername: Dispatch<SetStateAction<string | null>>
  avatarUrl: string | null
  setAvatarUrl: Dispatch<SetStateAction<string | null>>
}

export const ProfileContext = createContext<ProfileContextInterface>({
  "username": "",
  "setUsername": () => { },
  "avatarUrl": "",
  "setAvatarUrl": () => { }
})

const Home = ({ initialPosts, initialError }: IProps) => {
  const { isLoading, session, error } = useSessionContext()
  const supabase = useSupabaseClient()
  const user = useUser()
  const [username, setUsername] = useState<Profiles['username']>(null)
  const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null)

  let value = {
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl
  }

  useEffect(() => {
    async function getProfile(): Promise<void> {
      try {
        if (!session) throw new Error('No session')
        if (!user) throw new Error('No user')

        let { data, error, status } = await supabase
          .from('profiles')
          .select(`username, avatar_url`)
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setUsername(data.username)
          downloadImage(data.avatar_url)
          console.log("hi")
        }
      } catch (error) {
        alert('Error loading user data!')
        console.log(error)
      } finally {
        console.log("getProfile Done")
      }
    }

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
      } finally {
        console.log("download Image DONE")
      }
    }
    if (session) {
      getProfile()
    }
  }, [isLoading, session, user, supabase])

  return (
    <>
      <ProfileContext.Provider value={value}>
        <div className="bg-slate-100 flex flex-col justify-center items-center w-full">
          <Header />
          <div>
            <div>
              <Board initialPosts={initialPosts} initialError={initialError} />
            </div>
          </div>
        </div>
      </ProfileContext.Provider>
    </>
  )
}


export async function getServerSideProps() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  let { data, error, status } = await supabase
    .from('postsorderbydate')
    .select("*")
    .limit(50)

  if (error && status !== 406) {
    return {
      props: {
        initialPosts: [],
        initialError: true,
      }
    }
  }

  if (data) {
    return {
      props: {
        initialPosts: data,
        initialError: false,
      },
    }
  }
}

export default Home