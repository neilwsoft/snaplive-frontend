'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Room, RemoteParticipant } from 'livekit-client';
import { useLivestreamStore, ChatMessage } from '@/lib/stores/livestreamStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Pin,
  MessageCircle,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivestreamChatProps {
  room: Room;
  className?: string;
}

export function LivestreamChat({ room, className }: LivestreamChatProps) {
  const [message, setMessage] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const handlerRegistered = useRef(false);

  const {
    chatMessages,
    pinnedMessages,
    isChatVisible,
    addChatMessage,
    pinMessage,
    toggleChatVisibility,
  } = useLivestreamStore();

  // Register text stream handler for chat
  useEffect(() => {
    if (!room || handlerRegistered.current) return;

    const handleTextStream = async (
      reader: any,
      participantInfo: { identity: string }
    ) => {
      try {
        const text = await reader.readAll();
        const data = JSON.parse(text);

        if (data.type === 'chat') {
          const chatMsg: ChatMessage = {
            id: crypto.randomUUID(),
            userId: participantInfo.identity,
            username: data.username || participantInfo.identity,
            message: data.message,
            timestamp: Date.now(),
            role: data.role || 'buyer',
          };

          addChatMessage(chatMsg);
        }
      } catch (error) {
        console.error('Error reading chat message:', error);
      }
    };

    // Register handler for chat topic only once
    try {
      room.registerTextStreamHandler('chat', handleTextStream);
      handlerRegistered.current = true;
    } catch (error) {
      console.warn('Chat stream handler already registered:', error);
    }

    return () => {
      handlerRegistered.current = false;
    };
  }, [room, addChatMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAtBottom]);

  // Handle scroll to detect if user is at bottom
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isBottom =
      Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 50;
    setIsAtBottom(isBottom);
  }, []);

  // Send chat message
  const sendMessage = async () => {
    if (!message.trim() || !room) return;

    try {
      const localParticipant = room.localParticipant;

      // Determine role: check permissions to see if host/seller
      const isHost = localParticipant.permissions?.canPublish &&
        localParticipant.permissions?.canPublishData;
      const userRole = isHost ? 'seller' : 'buyer';

      const chatData = {
        type: 'chat',
        username: localParticipant.name || localParticipant.identity,
        message: message.trim(),
        role: userRole,
        timestamp: Date.now(),
      };

      await localParticipant.sendText(JSON.stringify(chatData), {
        topic: 'chat',
      });

      // Add own message immediately
      const chatMsg: ChatMessage = {
        id: crypto.randomUUID(),
        userId: localParticipant.identity,
        username: localParticipant.name || localParticipant.identity,
        message: message.trim(),
        timestamp: Date.now(),
        role: userRole,
      };

      addChatMessage(chatMsg);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
  };

  const getRoleBadgeColor = (role?: 'seller' | 'buyer' | 'moderator') => {
    switch (role) {
      case 'seller':
        return 'bg-blue-500 text-white';
      case 'moderator':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Floating toggle button when chat is hidden */}
      {!isChatVisible && (
        <Button
          onClick={toggleChatVisibility}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl z-50 bg-primary hover:bg-primary/90 transition-all hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {chatMessages.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {chatMessages.length > 99 ? '99+' : chatMessages.length}
            </Badge>
          )}
        </Button>
      )}

      {/* Chat overlay */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 flex flex-col bg-background/95 backdrop-blur-md border-l shadow-2xl z-40 transition-transform duration-300 ease-in-out',
          isChatVisible ? 'translate-x-0' : 'translate-x-full',
          'w-[400px]',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-semibold">Live Chat</h3>
            <Badge variant="secondary">{chatMessages.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleChatVisibility}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="bg-muted/50 border-b">
            {pinnedMessages.map((msg) => (
              <div
                key={msg.id}
                className="px-4 py-2 flex items-start gap-2 text-sm"
              >
                <Pin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{msg.username}</span>
                  <p className="text-muted-foreground truncate">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <ScrollArea
          className="flex-1 px-4 py-2"
          onScroll={handleScroll}
          ref={scrollRef}
        >
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {msg.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{msg.username}</span>
                    {msg.role && (
                      <Badge
                        variant="secondary"
                        className={cn('text-xs h-5', getRoleBadgeColor(msg.role))}
                      >
                        {msg.role}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    {!msg.isPinned && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => pinMessage(msg.id)}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {!isAtBottom && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-20 right-6 rounded-full shadow-lg h-8 w-8 z-10"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              maxLength={500}
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {message.length}/500
          </p>
        </div>
      </div>
    </>
  );
}
