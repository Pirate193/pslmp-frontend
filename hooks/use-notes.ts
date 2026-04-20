
import { notesapi } from "@/lib/api";
import { CreateNoteBody, UpdateNoteBody } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotes(folderId?:string){
  return useQuery({
    queryKey: queryKeys.notes.list(folderId),
    queryFn:()=>notesapi.list(folderId)
  })
}

export const useNote = (id:string)=>{
  return useQuery({
    queryKey:queryKeys.notes.detail(id),
    queryFn:()=>notesapi.get(id),
    enabled:!!id, // only run query if id is truthy
  })
}

export const useCreateNote = () =>{
  const queryclient = useQueryClient();
  return useMutation({
    mutationFn:(data:CreateNoteBody)=>notesapi.create(data),
    onSuccess:()=>{
      //invalite queries so that the list updates
      queryclient.invalidateQueries({queryKey:queryKeys.notes.all})
    }
  })
}

export const useUpdateNote = () =>{
  const queryclient = useQueryClient();
  return useMutation({
    mutationFn:({id,data}:{id:string,data:UpdateNoteBody})=>notesapi.update(id,data),
    onSuccess:(updatedNote)=>{
      queryclient.setQueryData(queryKeys.notes.detail(updatedNote.id),updatedNote)
      queryclient.invalidateQueries({queryKey:queryKeys.notes.all})
    }
  })
}

export const useDeleteNote = () =>{
  const queryclient = useQueryClient();
  return useMutation({
    mutationFn:(id:string)=>notesapi.delete(id),
    onSuccess:(_,id)=>{
        queryclient.removeQueries({queryKey:queryKeys.notes.detail(id)})
        queryclient.invalidateQueries({queryKey:queryKeys.notes.all})
    }
  })
}

export const useMoveNote = () =>{
  const queryclient = useQueryClient();
  return useMutation({
    mutationFn:({id,folderId}:{id:string,folderId:string|null})=>notesapi.move(id,folderId),
    onSuccess:()=>{
      queryclient.invalidateQueries({queryKey:queryKeys.notes.all})
    }
  })
}

