import AiChatComponent from "@/components/aicomponents/aichat";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
    const { chatId } = await params;
    return (
        <AiChatComponent chatId={chatId} />
    )
}