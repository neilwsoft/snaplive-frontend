"use client";

import { useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Trash2, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbotStore, type ChatbotMessage } from "@/lib/stores/chatbotStore";
import { cn } from "@/lib/utils";

const WELCOME_MESSAGE: ChatbotMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the SnapLive Assistant. I can help you with questions about LiveCam, LiveConnect, LiveHub, and all things SnapLive. What can I help you with?",
  timestamp: Date.now(),
};

export function ChatbotWidget() {
  const {
    messages,
    isOpen,
    isLoading,
    addMessage,
    setAssistantMessage,
    toggleOpen,
    setLoading,
    clearMessages,
  } = useChatbotStore();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      addMessage(WELCOME_MESSAGE);
    }
  }, [isOpen, messages.length, addMessage]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, []);

  // Derive last message content to trigger scroll during streaming updates
  const lastMessageContent = messages[messages.length - 1]?.content;

  // Scroll to bottom when messages change (new message added or content streamed)
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, lastMessageContent, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const content = textarea.value.trim();
    if (!content || isLoading) return;

    textarea.value = "";

    const userMessage: ChatbotMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatbotMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };
    addMessage(assistantMessage);
    setLoading(true);

    try {
      // Build conversation history (exclude welcome message and the empty assistant placeholder)
      const history = [...useChatbotStore.getState().messages]
        .filter((m) => m.id !== "welcome" && m.id !== assistantId)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Request failed" }));
        setAssistantMessage(assistantId, `Sorry, something went wrong: ${err.error || response.statusText}`);
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setAssistantMessage(assistantId, "Sorry, failed to read response.");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAssistantMessage(assistantId, accumulated);
      }
    } catch {
      setAssistantMessage(assistantId, "Sorry, I couldn't connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoading, addMessage, setAssistantMessage, setLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearMessages();
    hasInitialized.current = false;
  };

  return (
    <>
      {/* Floating toggle button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[380px] flex-col rounded-2xl border bg-background shadow-2xl"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-none">SnapLive Assistant</h3>
                <p className="text-xs text-muted-foreground">AI-powered help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClear}
                aria-label="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleOpen}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
            <div className="flex flex-col gap-3 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    {msg.content || (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Thinking...
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="Ask about SnapLive..."
                className="min-h-[40px] max-h-[100px] resize-none text-sm"
                rows={1}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={handleSend}
                disabled={isLoading}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
