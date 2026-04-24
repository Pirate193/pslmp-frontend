"use client";

import { useParams } from "next/navigation";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useCanvasStore } from "@/stores/canvasStore";
import Canvas from "@/components/aicomponents/canvas";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AiChatComponent from "@/components/aicomponents/aichat";

export default function ChatPage() {
  const { isCanvasOpen } = useCanvasStore();
  const params = useParams();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const defaultChatSize = isCanvasOpen ? 40 : 100;

  return (
    <div className="h-full w-full relative">
      <ResizablePanelGroup
        orientation="horizontal"
        // 1. Add a subtle background to the whole group so the "Card" pops against it
        className="h-full w-full bg-muted/10"
      >
        <ResizablePanel defaultSize={defaultChatSize} minSize={40}>
          <div className="h-full overflow-y-auto">
            <AiChatComponent chatId={params.chatId as string} />
          </div>
        </ResizablePanel>

        {!isMobile && isCanvasOpen && (
          <>
            {/* 2. Style the Handle 
             The 'bg-transparent' makes it feel like empty space between the panels 
          */}
            <ResizableHandle
              withHandle={false}
              className="bg-transparent w-2"
            />

            <ResizablePanel
              defaultSize={60}
              minSize={30}
              className="hidden lg:block"
            >
              {/* 3. THE GEMINI CANVAS CONTAINER 
               - p-3: Adds the "Gap" between the handle/edges and the content.
               - h-full: Ensures it fills the height.
            */}
              <div className="h-full p-3 pl-0">
                {/* 4. THE ACTUAL "CARD"
                 - h-full w-full: Fill the container.
                 - bg-background/bg-card: The color of the "paper".
                 - rounded-3xl: This creates the heavy Gemini-style curves.
                 - border: A subtle outline definition.
                 - shadow-sm: Slight lift (optional).
                 - overflow-hidden: CRITICAL. Ensures the NotesPanel scrollbar 
                   respects the rounded corners.
              */}
                <div className="h-full w-full bg-background rounded-3xl border shadow-sm overflow-hidden flex flex-col">
                  <Canvas />
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-muted/10 flex flex-col lg:hidden transition-transform duration-300 ease-in-out",
          isCanvasOpen && isMobile ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Mobile Canvas Content */}
        <div className="flex-1 p-2 overflow-hidden">
          {/* Re-using the rounded card look but maximizing space */}
          <div className="h-full w-full bg-background rounded-2xl border shadow-sm overflow-hidden flex flex-col">
            <Canvas />
          </div>
        </div>
      </div>
    </div>
  );
}