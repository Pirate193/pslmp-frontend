import { templateapi } from "@/lib/api"
import { CreateTemplateBody } from "@/lib/api-types"
import { queryKeys } from "@/lib/query-keys"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const useMyTemplates = () =>{
    return useQuery({
        queryKey:queryKeys.templates.mine(),
        queryFn:()=>templateapi.my()
    })
}

export const useCommunityTemplates = () =>{
    return useQuery({
        queryKey:queryKeys.templates.community(),
        queryFn:()=>templateapi.community()
    })
}

export const useTemplate = (id:string) =>{
    return useQuery({
        queryKey:queryKeys.templates.detail(id),
        queryFn:()=>templateapi.get(id),
        enabled:!!id
    })
}

export const useCreateTemplate = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:(data:CreateTemplateBody)=>templateapi.create(data),
        onSuccess:()=>{
            queryclient.invalidateQueries({queryKey:queryKeys.templates.all})
        }
    })
}

export const useCreateTemplateFromNote = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:({noteId,body}:{noteId:string,body:{title:string,description:string,ispublic:boolean}}) => templateapi.createfromnote(noteId,body),
        onSuccess:()=>{
            queryclient.invalidateQueries({queryKey:queryKeys.templates.all})
        }
    })
}

export const useApplyTemplate = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:({id,noteId}:{id:string,noteId?:string})=>templateapi.apply(id,noteId),
        onSuccess:()=>{
            queryclient.invalidateQueries({queryKey:queryKeys.templates.all})
            queryclient.invalidateQueries({queryKey:queryKeys.notes.all})
        }
    })
}

export const useUpdateTemplate = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:({id,data}:{id:string,data:Partial<CreateTemplateBody>})=>templateapi.update(id,data),
        onSuccess:(updatedTemplate)=>{
            queryclient.setQueryData(queryKeys.templates.detail(updatedTemplate.id),updatedTemplate)
            queryclient.invalidateQueries({queryKey:queryKeys.templates.all})
        }
    })
}

export const useDeleteTemplate = ()=>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:(id:string)=>templateapi.delete(id),
        onSuccess:()=>{
            queryclient.invalidateQueries({queryKey:queryKeys.templates.all})
        }
    })
}