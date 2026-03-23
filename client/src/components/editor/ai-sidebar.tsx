import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  Send,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useStore, type CanvasElement } from "../../store/useStore";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000";

export const AISidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { aiChatHistory, addChatMessage, canvasElements, setCanvasElements } = useStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isCollapsed) {
      scrollToBottom();
    }
  }, [aiChatHistory, isLoading, isCollapsed]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    addChatMessage({ role: "user", content: userMessage });
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/generate`, {
        prompt: userMessage,
        canvasState: canvasElements,
      });

      const data = response.data;
      
      if (data.rooms || data.elements) {
        const newElements: CanvasElement[] = [];
        
        if (data.rooms) {
          data.rooms.forEach((room: any) => {
            newElements.push({
              id: uuidv4(),
              type: 'room',
              x: room.x,
              y: room.y,
              width: room.width,
              height: room.height,
              rotation: 0,
              metadata: { label: room.label || "Room" }
            });
          });
        }
        
        if (data.elements) {
          data.elements.forEach((el: any) => {
            newElements.push({
              id: uuidv4(),
              type: el.type, // door or window
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              rotation: 0,
              metadata: { label: el.type.charAt(0).toUpperCase() + el.type.slice(1) }
            });
          });
        }

        if (newElements.length > 0) {
          // Add newly generated elements to existing ones
          setCanvasElements([...canvasElements, ...newElements]);
        }
      }

      addChatMessage({ 
        role: "assistant", 
        content: data.explanation || "I've updated the layout based on your request." 
      });
    } catch (error) {
      console.error("AI Error:", error);
      addChatMessage({ 
        role: "assistant", 
        content: "I'm sorry, I encountered an error while processing your request. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      className={`h-full relative group transition-all duration-300 pointer-events-auto ${isCollapsed ? "w-16" : "w-[380px]"}`}
    >
      <TooltipProvider>
        <Card className="h-full flex flex-col shadow-2xl rounded-3xl border-slate-200/60 overflow-hidden bg-white/95 backdrop-blur-xl">
          {/* Header */}
          <CardHeader
            className={`p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between ${isCollapsed ? "flex-col gap-4" : ""}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold tracking-tight">
                      AI Architect
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-100 uppercase font-bold"
                    >
                      Beta
                    </Badge>
                  </div>
                  <CardDescription className="text-[10px] text-slate-400">
                    DeepMind Architecture Engine
                  </CardDescription>
                </div>
              )}
            </div>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all ${isCollapsed ? "rotate-180" : ""}`}
                  >
                    {isCollapsed ? (
                      <ChevronLeft className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                }
              />
              <TooltipContent side="left">
                <span>
                  {isCollapsed ? "Expand Assistant" : "Collapse Assistant"}
                </span>
              </TooltipContent>
            </Tooltip>
          </CardHeader>

          <CardContent
            className={`flex-1 min-h-0 overflow-hidden p-0 flex flex-col ${isCollapsed ? "hidden" : "block"}`}
          >
            <ScrollArea className="flex-1 px-4 py-6">
              <div className="space-y-6">
                {aiChatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col animate-[in_0.3s_ease-out] ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100"
                          : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none font-medium"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-2 px-1 uppercase tracking-tighter">
                      {msg.role === "assistant" ? "AI Architect" : "Me"} • Just
                      now
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-blue-600 text-[10px] font-bold px-1 italic">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing floor plan...
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Chat Input */}
          {!isCollapsed && (
            <CardFooter className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50">
              <div className="relative w-full group">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Suggest a modern kitchen layout..."
                  rows={2}
                  className="min-h-[80px] w-full resize-none pr-12 text-sm bg-white border-slate-200/60 focus:ring-blue-500/20 rounded-xl px-4 py-3 shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all rounded-lg disabled:bg-slate-200"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardFooter>
          )}

          {/* Quick Actions at Bottom when Collapsed */}
          {isCollapsed && (
            <div className="flex-1 flex flex-col items-center py-6 gap-6 text-slate-400">
              <Settings className="w-5 h-5 hover:text-blue-600 cursor-pointer transition-colors" />
              <HelpCircle className="w-5 h-5 hover:text-blue-600 cursor-pointer transition-colors" />
            </div>
          )}
        </Card>
      </TooltipProvider>
    </aside>
  );
};

export default AISidebar;
