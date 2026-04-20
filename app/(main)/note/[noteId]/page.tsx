import NoteContentInner from "@/components/tabs/content/NoteContentInner";

export default async function NotePage({params}: {params: {noteId: string}}) {
    const noteId = await params.noteId;
    return (
        <NoteContentInner noteId={noteId} />
    );
}