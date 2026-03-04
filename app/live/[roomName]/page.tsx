'use client';

/**
 * Live Room Page
 * Join a livestream as either host or viewer
 */

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LiveRoom, ViewerRoom, HostRoom } from '@/components/livestream/LiveRoom';
import { LiveSimulcastRoom } from '@/components/livestream/simulcast';
import { createToken, getRoom } from '@/lib/api/livekit';
import { getSessionByRoomName } from '@/lib/api/livestream';
import type { LivestreamSession } from '@/lib/api/livestream-sessions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{
    roomName: string;
  }>;
}

export default function LiveRoomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [session, setSession] = useState<LivestreamSession | null>(null);

  // Get participant info from query params
  const participantType = searchParams.get('type') || 'viewer'; // 'host' or 'viewer'
  const participantName = searchParams.get('name') || 'Anonymous';
  const urlToken = searchParams.get('token'); // Token passed from simulcast page
  const urlServerUrl = searchParams.get('serverUrl'); // Server URL passed from simulcast page
  const urlDestinationIds = searchParams.get('destinationIds'); // Destination IDs for RTMP egress
  const destinationIds = urlDestinationIds ? urlDestinationIds.split(',').filter(Boolean) : [];

  // Get participantId safely (localStorage not available during SSR)
  const [participantId, setParticipantId] = useState<string>(`user-${Date.now()}`);

  useEffect(() => {
    const urlUserId = searchParams.get('userId');
    if (urlUserId) {
      setParticipantId(urlUserId);
    } else if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setParticipantId(storedUserId);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function joinRoom() {
      try {
        setLoading(true);
        setError(null);

        // If token and serverUrl are provided in URL (from simulcast page), use them directly
        if (urlToken && urlServerUrl) {
          console.log('Using token and serverUrl from URL');
          setToken(urlToken);
          setServerUrl(urlServerUrl);
          setIsHost(participantType === 'host');

          // Still fetch session for products
          try {
            const sessionData = await getSessionByRoomName(resolvedParams.roomName);
            if (sessionData?._id) {
              setSession(sessionData);
              console.log('Found session:', sessionData._id, 'with', sessionData.products?.length || 0, 'products');
            }
          } catch (sessionError) {
            console.warn('Could not fetch session for room:', sessionError);
          }

          setLoading(false);
          return;
        }

        // Check if room exists (with retry for race condition)
        let roomData: any = null;
        let retries = 5; // Increased from 3 to 5
        let lastError: any = null;

        while (!roomData && retries > 0) {
          try {
            roomData = await getRoom(resolvedParams.roomName);
            if (!roomData) {
              // Room API returned but room not found yet
              throw new Error('Room not found in list');
            }
          } catch (err) {
            lastError = err;
            retries--;
            if (retries > 0) {
              // Progressive delay: start with 800ms, increase to 1200ms
              const delay = 800 + (5 - retries) * 200;
              console.log(`Room not ready yet, retrying in ${delay}ms... (${retries} attempts left)`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              console.error('Failed to find room after all retries:', lastError);
              setError('Room not found. The stream may still be initializing. Please wait a moment and try refreshing the page.');
              setLoading(false);
              return;
            }
          }
        }

        // Check if current user is the room owner (host)
        let finalParticipantType = participantType;

        if (roomData?.metadata) {
          try {
            const metadata = JSON.parse(roomData.metadata);
            const roomOwnerId = metadata.seller_id;

            // If current user is the room owner, allow them to join as host
            if (roomOwnerId === participantId) {
              finalParticipantType = 'host';
              setIsHost(true);
              console.log('User is the room owner - joining as host');
            }
          } catch (parseError) {
            console.warn('Failed to parse room metadata:', parseError);
          }
        }

        // Fetch livestream session by room name (for live stats and products)
        try {
          const sessionData = await getSessionByRoomName(resolvedParams.roomName);
          if (sessionData?._id) {
            setSession(sessionData);
            console.log('Found session:', sessionData._id, 'with', sessionData.products?.length || 0, 'products');
          }
        } catch (sessionError) {
          console.warn('Could not fetch session for room:', sessionError);
          // Continue without session - stats won't be available but stream will work
        }

        // Get access token
        const tokenResponse = await createToken({
          room_name: resolvedParams.roomName,
          participant_name: participantName,
          participant_id: participantId,
          participant_type: finalParticipantType as 'host' | 'viewer',
        });

        setToken(tokenResponse.token);
        setServerUrl(tokenResponse.url);
      } catch (err: any) {
        console.error('Failed to join room:', err);
        setError(err.response?.data?.detail || 'Failed to join room');
      } finally {
        setLoading(false);
      }
    }

    joinRoom();
  }, [resolvedParams.roomName, participantName, participantId, participantType, urlToken, urlServerUrl]);

  const handleDisconnect = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-semibold">Connecting to stream...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Preparing your livestream experience
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Unable to Join Stream</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              variant="default"
            >
              Retry
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return null;
  }

  // Render appropriate room component based on whether user is host
  return (
    <div className="h-screen w-screen">
      {isHost || participantType === 'host' ? (
        <LiveSimulcastRoom
          token={token}
          serverUrl={serverUrl}
          roomName={resolvedParams.roomName}
          participantName={participantName}
          session={session}
          destinationIds={destinationIds}
          onDisconnected={handleDisconnect}
        />
      ) : (
        <ViewerRoom
          token={token}
          serverUrl={serverUrl}
          roomName={resolvedParams.roomName}
          onDisconnected={handleDisconnect}
        />
      )}
    </div>
  );
}
