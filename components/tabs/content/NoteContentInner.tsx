'use client';



import { useTabStore } from '@/stores/tabstore';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useNote, useUpdateNote } from '@/hooks/use-notes';
import Notesheader from '@/components/notescomponent/noteheader';
import BlocknoteEditor from '@/components/notescomponent/blocknote-editor';
import { BlockNoteContent } from '@/lib/api-types';



interface NoteContentInnerProps {
  noteId: string;
  folderId?: string;
}

const NoteContentInner = ({ noteId, folderId }: NoteContentInnerProps) => {
  const {data:note,isLoading:noteLoading} = useNote(noteId);
  const updateTabTitle = useTabStore((s) => s.updateTabTitle);
  const {mutateAsync:updateContent,isPending:updateContentLoading} = useUpdateNote();

  const [content, setContent] = useState<BlockNoteContent|undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note?.title) {
      updateTabTitle(`note-${noteId}`, note.title);
    }
  }, [note?.title, noteId, updateTabTitle]);

  // Refs for debouncing
    const contentTimerRef = useRef<NodeJS.Timeout | null>(null);
    const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const handleContentChange = (newContent:BlockNoteContent) => {
      setContent(newContent);
      setIsSaving(true);
  
      // Clear previous timer
      if (contentTimerRef.current) {
        clearTimeout(contentTimerRef.current);
      }
  
      // Set new timer
      contentTimerRef.current = setTimeout(async () => {
        try {
          await updateContent({
            id:noteId,
            data:{
              content:newContent,
            },
          });
        } catch (error) {
          console.error("Failed to save content:", error);
        } finally {
          setIsSaving(false);
        }
      }, 5000); // 5 second debounce
    };
  
    // Cleanup timers on unmount
    useEffect(() => {
      return () => {
        if (contentTimerRef.current) {
          clearTimeout(contentTimerRef.current);
        }
        if (titleTimerRef.current) {
          clearTimeout(titleTimerRef.current);
        }
      };
    }, []);
  
    // Loading state
    if (noteLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
   if(!note){
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">note not found</p>
      </div>
    );
   }
  

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <Notesheader
        noteId={noteId}
        folderId={folderId}
      />
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
        <div className="p-4 pb-12">
              <BlocknoteEditor
                initialContent={note.content}
                onChangeContent={handleContentChange}
                editable={true}
              />
        </div>
      </div>
      {note && (
        <div className="absolute bottom-2 right-4 text-xs text-muted-foreground z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded pointer-events-none">
          {isSaving ? "Saving..." : "Saved"} Last edited: {new Date(note.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default NoteContentInner;