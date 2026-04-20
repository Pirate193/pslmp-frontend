import { chatapi } from "@/lib/api"
import { AddMessageBody, CreateChatBody } from "@/lib/api-types"
import { queryKeys } from "@/lib/query-keys"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const useChats = ()=>{
    return useQuery({
        queryKey:queryKeys.chats.all,
        queryFn:()=>chatapi.list()
    })
}

export const useChat = (id:string)=>{
    return useQuery({
        queryKey:queryKeys.chats.detail(id),
        queryFn:()=>chatapi.get(id),
        enabled:!!id
    })
}

export const useCreateChat = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:(data:CreateChatBody)=>chatapi.create(data),
        onSuccess:()=>{
            queryclient.invalidateQueries({queryKey:queryKeys.chats.all})
        }
    })
}

export const useUpdateChat = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:({id,data}:{id:string,data:{title:string}})=>chatapi.update(id,data),
        onSuccess:(updatedChat)=>{
            queryclient.setQueryData(queryKeys.chats.detail(updatedChat.id),updatedChat)
            queryclient.invalidateQueries({queryKey:queryKeys.chats.all})
        }
    })
}

export const useDeleteChat = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:(id:string)=>chatapi.delete(id),
        onSuccess:()=>{
            queryclient.invalidateQueries({queryKey:queryKeys.chats.all})
        }
    })
}

export const useAddMessage = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:({id,body}:{id:string,body:AddMessageBody})=>chatapi.addmessage(id,body),
        onSuccess:(_, {id})=>{
            queryclient.invalidateQueries({queryKey:queryKeys.chats.detail(id)})
        }
    })
}