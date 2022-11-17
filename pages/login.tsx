import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from '../components/Accounts'
import Header from '../components/Header'

const Login = () => {
    const session = useSession()
    const supabase = useSupabaseClient()

    return (
        <div className="bg-slate-100 flex flex-col justify-center items-center w-screen">
            <Header />
            <div className="container w-full flex flex-col justify-center items-center">
                <div className="w-full text-center m-12">
                    {!session ? (
                        <h1 className="text-3xl underline">Login to THIS SITE</h1>
                    ) : (
                        <h1 className="text-3xl underline">You are already logged in</h1>
                    )}
                </div>
                <div className="w-full m-12 flex justify-center items-center">
                    {!session ? (
                        <Auth
                            supabaseClient={supabase}
                            redirectTo="/login/"
                            appearance={{ theme: ThemeSupa }}
                            theme="dark"
                        />
                    ) : (
                        <div>
                            <Account session={session} />
                        </div>
                    )}
                </div>
            </div>
        </div>

    )
}

export default Login