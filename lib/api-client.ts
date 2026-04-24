import axios from "axios";
import { redirect } from "next/navigation";

const apiClient = axios.create({
    baseURL:"https://api.pslmp.foldex.space",
    withCredentials:true,
    headers:{
        "Content-Type":"application/json"
    }
})

//global error handler when unauthenticated
apiClient.interceptors.response.use(
    (response)=>response,
    (error)=>{
        if(error.response?.status === 401){
            redirect("/sign-in")
        }
        return Promise.reject(error)
    }
)

export default apiClient