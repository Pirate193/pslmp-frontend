import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";


export const authClient = createAuthClient({
    baseURL:process.env.NEXT_PUBLIC_API_URL ?? "https://api.pslmp.foldex.space",
    plugins:[
        emailOTPClient()
    ]
})

//not needed you can access this using the authclient. this is for convience
export const {useSession,signOut}=authClient;