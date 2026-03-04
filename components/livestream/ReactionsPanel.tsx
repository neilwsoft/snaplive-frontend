'use client';

import { useState, useEffect, useRef } from 'react';
import { Room } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useLivestreamStore, Reaction } from '@/lib/stores/livestreamStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Heart,
  ThumbsUp,
  Flame,
  PartyPopper,
  Star,
  Smile,
  Gift as GiftIcon,
} from 'lucide-react';

interface ReactionsPanelProps {
  room: Room;
  className?: string;
}

const REACTIONS = [
  { emoji: '❤️', icon: Heart, name: 'heart', color: 'text-red-500' },
  { emoji: '👍', icon: ThumbsUp, name: 'like', color: 'text-blue-500' },
  { emoji: '🔥', icon: Flame, name: 'fire', color: 'text-orange-500' },
  { emoji: '🎉', icon: PartyPopper, name: 'party', color: 'text-purple-500' },
  { emoji: '⭐', icon: Star, name: 'star', color: 'text-yellow-500' },
  { emoji: '😊', icon: Smile, name: 'smile', color: 'text-green-500' },
];

export function ReactionsPanel({ room, className }: ReactionsPanelProps) {
  const [showPanel, setShowPanel] = useState(false);
  const handlerRegistered = useRef(false);

  const { activeReactions, addReaction, removeReaction, clearOldReactions } =
    useLivestreamStore();

  // Register data channel handler for reactions
  useEffect(() => {
    if (!room || handlerRegistered.current) return;

    const handleTextStream = async (reader: any, participantInfo: { identity: string }) => {
      try {
        const text = await reader.readAll();
        const data = JSON.parse(text);

        if (data.type === 'reaction') {
          const reaction: Reaction = {
            id: crypto.randomUUID(),
            emoji: data.emoji,
            userId: participantInfo.identity,
            timestamp: Date.now(),
            x: Math.random() * 80 + 10, // Random x position (10-90%)
            y: 100, // Start from bottom
          };

          addReaction(reaction);
        }
      } catch (error) {
        console.error('Error reading reaction:', error);
      }
    };

    // Register handler only once
    try {
      room.registerTextStreamHandler('reactions', handleTextStream);
      handlerRegistered.current = true;
    } catch (error) {
      console.warn('Reactions stream handler already registered:', error);
    }

    return () => {
      handlerRegistered.current = false;
    };
  }, [room, addReaction]);

  // Clean up old reactions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      clearOldReactions();
    }, 1000);

    return () => clearInterval(interval);
  }, [clearOldReactions]);

  // Remove reaction after animation completes
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    activeReactions.forEach((reaction) => {
      const timer = setTimeout(() => {
        removeReaction(reaction.id);
      }, 3000); // Remove after 3 seconds
      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [activeReactions, removeReaction]);

  const sendReaction = async (emoji: string) => {
    if (!room) return;

    try {
      const localParticipant = room.localParticipant;

      // Send reaction to other participants
      const reactionData = {
        type: 'reaction',
        emoji,
        timestamp: Date.now(),
      };

      await localParticipant.sendText(JSON.stringify(reactionData), {
        topic: 'reactions',
      });

      // Add own reaction immediately
      const reaction: Reaction = {
        id: crypto.randomUUID(),
        emoji,
        userId: localParticipant.identity,
        timestamp: Date.now(),
        x: Math.random() * 80 + 10,
        y: 100,
      };

      addReaction(reaction);
      setShowPanel(false);
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  return (
    <>
      {/* Reaction Animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {activeReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{
                x: `${reaction.x}%`,
                y: '100%',
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: '-20%',
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1, 0.8],
                x: `${reaction.x + (Math.random() * 20 - 10)}%`, // Add drift
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 3,
                ease: 'easeOut',
              }}
              className="absolute text-4xl"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction Panel */}
      <div className={cn('relative', className)}>
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-2 left-0 bg-background border rounded-lg shadow-lg p-2"
            >
              <div className="flex gap-1">
                {REACTIONS.map((reaction) => (
                  <Button
                    key={reaction.name}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-10 w-10 text-2xl hover:scale-125 transition-transform',
                      reaction.color
                    )}
                    onClick={() => sendReaction(reaction.emoji)}
                  >
                    {reaction.emoji}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={() => setShowPanel(!showPanel)}
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}

// Quick reaction button component for mobile
export function QuickReactionButton({
  emoji,
  room,
  className,
}: {
  emoji: string;
  room: Room;
  className?: string;
}) {
  const { addReaction } = useLivestreamStore();

  const sendQuickReaction = async () => {
    if (!room) return;

    try {
      const localParticipant = room.localParticipant;

      const reactionData = {
        type: 'reaction',
        emoji,
        timestamp: Date.now(),
      };

      await localParticipant.sendText(JSON.stringify(reactionData), {
        topic: 'reactions',
      });

      const reaction: Reaction = {
        id: crypto.randomUUID(),
        emoji,
        userId: localParticipant.identity,
        timestamp: Date.now(),
        x: Math.random() * 80 + 10,
        y: 100,
      };

      addReaction(reaction);
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('text-2xl h-12 w-12', className)}
      onClick={sendQuickReaction}
    >
      {emoji}
    </Button>
  );
}
