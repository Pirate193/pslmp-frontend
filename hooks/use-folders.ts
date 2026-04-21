import { folderapi } from "@/lib/api"
import { CreateFolderBody, UpdateFolderBody } from "@/lib/api-types"
import { queryKeys } from "@/lib/query-keys"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const useFolders = () =>{
    return useQuery({
        queryKey:queryKeys.folders.all,
        queryFn:()=>folderapi.list()
    })
}

export const useFolder = (id:string)=>{
    return useQuery({
        queryKey:queryKeys.folders.detail(id),
        queryFn:()=>folderapi.get(id),
        enabled:!!id
    })
}
export const useCreateFolder = () =>{
  const queryclient = useQueryClient();
  return useMutation({
    mutationFn:(data:CreateFolderBody)=>folderapi.create(data),
    onSuccess:()=>{
        queryclient.invalidateQueries({queryKey:queryKeys.folders.all})
    }
  })
}

export const useUpdateFolder = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:({id,data}:{id:string,data:UpdateFolderBody})=>folderapi.update(id,data),
        onSuccess:(updatedfolder)=>{
            queryclient.setQueryData(queryKeys.folders.detail(updatedfolder.id),updatedfolder)
            queryclient.invalidateQueries({queryKey:queryKeys.folders.all})
        }
    })
}

export const useDeleteFolder = () =>{
    const queryclient = useQueryClient();
    return useMutation({
        mutationFn:(id:string)=>folderapi.delete(id),
        onSuccess:()=>{
            queryclient.invalidateQueries({queryKey:queryKeys.folders.all})
            queryclient.invalidateQueries({queryKey:queryKeys.notes.all})
        }
    })
}