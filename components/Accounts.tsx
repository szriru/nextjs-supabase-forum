import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session, } from '@supabase/auth-helpers-react'
import { Database } from '../utils/database.types'
import Avatar from './Avatar'
type Profiles = Database['public']['Tables']['profiles']['Row']

export default function Account({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>()
  const user = useUser()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<Profiles['username']>(null)
  const [website, setWebsite] = useState<Profiles['website']>(null)
  const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(null)

  useEffect(() => {
    getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!user) throw new Error('No user')

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      alert('Error loading user data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: Profiles['username']
    website: Profiles['website']
    avatar_url: Profiles['avatar_url']
  }) {
    try {
      setLoading(true)
      if (!user) throw new Error('No user')

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container w-full">
      <div className="w-[600px] border-2 border-slate-400 p-4  flex flex-col justify-center items-center">
        <div>
          <h1 className="text-3xl">Your Profile</h1>
        </div>
        <table className="m-4 border-spacing-4 border border-separate table-auto w-full">
          <tbody className="text-center ">
            <tr className="border-slate-300">
              <td><label htmlFor="email">Email</label></td>
              <td><input className="bg-slate-200 rounded-lg p-2" id="email" type="text" value={session.user.email} disabled /></td>
            </tr>
            <tr>
              <td><label htmlFor="username">Username</label></td>
              <td>
                <input
                  className="bg-slate-200 rounded-lg p-2"
                  id="username"
                  type="text"
                  placeholder="Set Username"
                  value={username || ''}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td><label htmlFor="website">Website</label></td>
              <td>
                <input
                  className="bg-slate-200 rounded-lg p-2"
                  id="website"
                  type="website"
                  value={website || ''}
                  placeholder="Set website"
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td>
                <label htmlFor="avatar">Avatar</label>
              </td>
              <td>
                <Avatar
                  uid={user.id}
                  url={avatar_url}
                  size={150}
                  onUpload={(url) => {
                    setAvatarUrl(url)
                    updateProfile({ username, website, avatar_url: url })
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="m-4">
          <button
            className="bg-sky-300 border-slate-500 p-2 rounded-lg border-2"
            onClick={() => updateProfile({ username, website, avatar_url })}
            disabled={loading}
          >
            {loading ? 'Loading ...' : 'Update Profile'}
          </button>
        </div>

        <div className="m-4">
          <button
            className="bg-red-500 border-slate-500 p-2 rounded-lg border-2"
            onClick={() => supabase.auth.signOut()}
          >
            Log Out
          </button>
        </div>
      </div>

    </div >
  )
}