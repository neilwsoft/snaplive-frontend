'use client';

/**
 * LivestreamList Component
 * Display list of active livestreams
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { listRooms, type Room } from '@/lib/api/livekit';
import { Loader2, Users, Video } from 'lucide-react';
import { toast } from 'sonner';

interface LivestreamListProps {
  userId: string;
  userName: string;
  refreshInterval?: number; // in milliseconds
}

export function LivestreamList({ userId, userName, refreshInterval = 5000 }: LivestreamListProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const response = await listRooms();
      setRooms(response.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load livestreams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();

    // Refresh room list periodically
    const interval = setInterval(fetchRooms, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleJoinRoom = (roomName: string, isOwner: boolean = false) => {
    const participantType = isOwner ? 'host' : 'viewer';
    router.push(
      `/live/${roomName}?type=${participantType}&name=${encodeURIComponent(userName)}&userId=${userId}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Video className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">No active livestreams</p>
          <p className="text-sm text-gray-500 mt-1">
            Check back later for live shopping sessions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Livestreams</h2>
        <Badge variant="secondary">
          {rooms.length} {rooms.length === 1 ? 'stream' : 'streams'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          // Parse metadata if available
          let metadata: any = {};
          try {
            if (room.metadata) {
              metadata = JSON.parse(room.metadata);
            }
          } catch (e) {
            // Ignore parse errors
          }

          // Check if current user is the room owner
          const isOwner = metadata.seller_id === userId;

          return (
            <Card key={room.sid} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {isOwner ? 'Your Stream' : `Seller ID: ${metadata.seller_id || 'Unknown'}`}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="ml-2">
                    🔴 LIVE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>
                    {room.num_participants} / {room.max_participants} viewers
                  </span>
                </div>

                {metadata.enable_agent && (
                  <Badge variant="outline" className="text-xs">
                    🤖 AI Assistant Enabled
                  </Badge>
                )}

                {isOwner && (
                  <Badge variant="secondary" className="text-xs">
                    👤 You are hosting
                  </Badge>
                )}

                <Button
                  onClick={() => handleJoinRoom(room.name, isOwner)}
                  className="w-full"
                  variant={isOwner ? "default" : "outline"}
                >
                  {isOwner ? '🎥 Rejoin as Host' : 'Join Stream'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
