'use client';

/**
 * StartLivestream Component
 * Create a room and start livestreaming
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { createRoom } from '@/lib/api/livekit';
import { Loader2, Video } from 'lucide-react';
import { toast } from 'sonner';

interface StartLivestreamProps {
  sellerId: string;
  sellerName: string;
}

export function StartLivestream({ sellerId, sellerName }: StartLivestreamProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enableAgent, setEnableAgent] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(100);

  const handleStartStream = async () => {
    try {
      setLoading(true);

      // Generate unique room name
      const timestamp = Date.now();
      const roomName = `${sellerId}-${timestamp}`;

      // Create room
      await createRoom({
        room_name: roomName,
        seller_id: sellerId,
        max_participants: maxParticipants,
        enable_agent: enableAgent,
      });

      toast.success('Room created successfully! Preparing stream...');

      // Wait a bit to ensure LiveKit room is fully initialized
      // This prevents race conditions when joining immediately
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to live room as host
      router.push(
        `/live/${roomName}?type=host&name=${encodeURIComponent(sellerName)}&userId=${sellerId}`
      );
    } catch (error: any) {
      console.error('Failed to create room:', error);
      toast.error(error.response?.data?.detail || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Start Livestream
        </CardTitle>
        <CardDescription>Configure your live streaming session</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Maximum Viewers</Label>
          <Input
            id="maxParticipants"
            type="number"
            min={1}
            max={1000}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enableAgent"
            checked={enableAgent}
            onCheckedChange={(checked) => setEnableAgent(checked as boolean)}
          />
          <Label htmlFor="enableAgent" className="text-sm font-normal">
            Enable AI Assistant (helps describe products and engage with viewers)
          </Label>
        </div>

        <Button onClick={handleStartStream} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Room...
            </>
          ) : (
            <>
              <Video className="mr-2 h-4 w-4" />
              Go Live
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
