"use client";

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { GlobeIcon } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "../ai-elements/reasoning";
import { useApiKeys } from "@/hooks/use-settings";
import { getAvailableModels } from "@/lib/providers";
import { toast } from "sonner";
import { useAiStore } from "@/stores/aistore";
import { useAddMessage, useChatMessages } from "@/hooks/use-chat";
import { SidebarTrigger } from "../ui/sidebar";
import { ChatHistoryPopover } from "./chathistorypopover";

const AI_CHAT_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api/ai/chat`;

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <Attachment
          data={attachment}
          key={attachment.id}
          onRemove={() => attachments.remove(attachment.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
};

const AiChatComponent = ({chatId}:{chatId:string}) => {
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const {data:initialMessages,isLoading:isLoadingInitialMessages}=useChatMessages(chatId);
  const {mutateAsync:addMessage,isPending:isPendingAddMessage}=useAddMessage();

  // Dynamic models
  const { data: apiKeys } = useApiKeys();
  const configuredProviders = useMemo(
    () => (apiKeys ?? []).map(k => k.provider),
    [apiKeys]
  );
  const availableModels = useMemo(
    () => getAvailableModels(configuredProviders),
    [configuredProviders]
  );
  const hasTavilyKey = configuredProviders.includes("tavily");
  const [model, setModel] = useState<string>("");
  const selectedModel = model || (availableModels.length > 0 ? availableModels[0].model.id : "");

  const pendingMessageProcessedRef = useRef(false);
  const [hasProcessedPendingMessage, setHasProcessedPendingMessage] =
    useState(false);
  const { body } = useAiStore();

  const pendingMessage = useAiStore((state) => state.pendingMessage);
  const setPendingMessage = useAiStore((state) => state.setPendingMessage);
  const hasInitialized = useRef(false);

  const { messages, status, sendMessage,setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: AI_CHAT_URL,
      credentials: "include",
    }),
    id: chatId,
    onFinish: async (message) => {
        if (message.message.role === "assistant") {
          const textContent = message.message.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("\n");
          await addMessage({
            id:chatId,
            body:{
              role: message.message.role,
              content: textContent,
              parts: message.message.parts,
            }
          });
        }
      },
    onError: (error) => {
      toast.error(error.message || "Something went wrong with the AI request");
    },
  });
  useEffect(() => {
    if (
      initialMessages &&
      initialMessages.length > 0 &&
      !hasInitialized.current
    ) {
      hasInitialized.current = true;
      const transformedMessages = initialMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        parts: msg.parts || [{ type: "text", text: msg.content }],
      }));

      setMessages(transformedMessages as unknown as UIMessage[]);
      console.log(" Loaded messages from database:", transformedMessages.length);
    }
  }, [initialMessages, setMessages]);

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) return;
    if (!selectedModel) {
      toast.error("No AI model available. Add an API key in Settings → API Keys.");
      return;
    }

    try {
      await addMessage({
        id:chatId,
        body:{
          role: "user",
          content: message.text || "",
          parts: [{ type: "text", text: message.text }],
        },
      });
    } catch (error) {
      console.error("Failed to save user message:", error);
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: selectedModel,
          webSearch: useWebSearch,
        },
      }
    );
    setText("");
  };
  useEffect(() => {
    const sendInitialMessage = async () => {
      // Check if there is a pending message and we haven't processed it yet
      if (
        pendingMessage &&
        !pendingMessageProcessedRef.current &&
        initialMessages &&
        initialMessages.length === 0
      ) {
        console.log("Sending pending message from store:", pendingMessage);
        pendingMessageProcessedRef.current = true;

        // Send the pending message
        
        
    
        setModel(body.model);
        setUseWebSearch(body.webSearch);
        try {
          await addMessage({
            id:chatId,
            body:{
              role: "user",
              content: pendingMessage.text || "",
              parts: [{ type: "text", text: pendingMessage.text }],
            }
            
          });
        } catch (error) {
          console.error("Failed to save user message:", error);
        }
        console.log("body", body);
        sendMessage(
          {
            text: pendingMessage.text || "",
            files: pendingMessage.files,
          },
          {
            body: {
              webSearch: useWebSearch,
              model: selectedModel,
            },
          },
        );
        // Clear the pending message from the store
        setPendingMessage(null);
        setHasProcessedPendingMessage(true);
      }
    };

    sendInitialMessage();
  }, [pendingMessage, initialMessages, setPendingMessage, body]);

  return (
    <div className=" p-6 relative size-full">
      <div className="flex flex-col h-full">
        <div className="flex gap-3 items-center">
        <SidebarTrigger />
        <ChatHistoryPopover />
      </div>
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <MessageResponse key={`${message.id}-${i}`}>
                            {part.text}
                          </MessageResponse>
                        );
                       case "reasoning":
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={
                                status === "streaming" &&
                                i === message.parts.length - 1 &&
                                message.id === messages.at(-1)?.id
                              }
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputHeader>
            <PromptInputAttachmentsDisplay />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger className="cursor-pointer" />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments className="cursor-pointer" />
                  <PromptInputActionAddScreenshot className="cursor-pointer" />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                onClick={() => {
                  if (!hasTavilyKey) {
                    toast.error("Add a Tavily API key in Settings to enable web search");
                    return;
                  }
                  setUseWebSearch(!useWebSearch);
                }}
                tooltip={{ content: hasTavilyKey ? "Search the web" : "Tavily key required", shortcut: "⌘K" }}
                variant={useWebSearch ? "default" : "ghost"}
                disabled={!hasTavilyKey}
                className="cursor-pointer"
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              {availableModels.length > 0 && (
                <PromptInputSelect
                  onValueChange={(value) => setModel(value)}
                  value={selectedModel}
                >
                  <PromptInputSelectTrigger>
                    <PromptInputSelectValue className="cursor-pointer" />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {availableModels.map(({ model: m, providerIcon }) => (
                      <PromptInputSelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2 cursor-pointer">
                          {providerIcon && (
                            <img src={providerIcon} alt="" className="h-4 w-4" />
                          )}
                          <span>{m.name}</span>
                        </div>
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              )}
            </PromptInputTools>
            <PromptInputSubmit disabled={(!text && !status) || !selectedModel} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default AiChatComponent;