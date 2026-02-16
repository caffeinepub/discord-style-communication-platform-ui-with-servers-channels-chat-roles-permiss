import { Button } from '@/components/ui/button';
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Volume2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigation } from '@/state/navigation';
import { useGetVoiceChannelParticipants, useJoinVoiceChannel, useLeaveVoiceChannel } from '@/hooks/useQueries';
import { useGetCategories, useGetUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

export default function VoiceView() {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const { selectedServerId, selectedChannelId } = useNavigation();
  const { identity } = useInternetIdentity();

  // Fetch participants for the selected voice channel
  const { data: participants = [] } = useGetVoiceChannelParticipants(selectedServerId, selectedChannelId);

  // Fetch categories to get channel name
  const { data: categories = [] } = useGetCategories(selectedServerId);

  // Mutations for joining/leaving
  const joinVoice = useJoinVoiceChannel();
  const leaveVoice = useLeaveVoiceChannel();

  // Find the current channel name
  const channelName = categories
    .flatMap((cat) => cat.voiceChannels)
    .find((ch) => ch.id === selectedChannelId)?.name || 'Voice Channel';

  // Check if current user is connected
  const isConnected = useMemo(() => {
    if (!identity) return false;
    const currentPrincipal = identity.getPrincipal().toString();
    return participants.some((p) => p.userId.toString() === currentPrincipal);
  }, [participants, identity]);

  const handleConnect = async () => {
    if (!selectedServerId || !selectedChannelId) return;
    try {
      await joinVoice.mutateAsync({ serverId: selectedServerId, voiceChannelId: selectedChannelId });
    } catch (error) {
      console.error('Failed to join voice channel:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedServerId || !selectedChannelId) return;
    try {
      await leaveVoice.mutateAsync({ serverId: selectedServerId, voiceChannelId: selectedChannelId });
      setIsMuted(false);
      setIsDeafened(false);
    } catch (error) {
      console.error('Failed to leave voice channel:', error);
    }
  };

  // Show empty state if no server/channel is selected
  if (!selectedServerId || !selectedChannelId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-muted-foreground">
        <Volume2 className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">Select a voice channel to connect</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex h-12 items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">{channelName}</h2>
        </div>
        <div className="text-sm text-muted-foreground">{isConnected ? 'Connected' : 'Not Connected'}</div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg font-semibold mb-4">
            Participants {participants.length > 0 && `(${participants.length})`}
          </h3>
          {participants.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Volume2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No one is in this voice channel yet</p>
            </div>
          ) : (
            participants.map((p) => <ParticipantRow key={p.userId.toString()} participant={p} />)
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-6 border-t border-border bg-accent/20">
        {!isConnected ? (
          <Button size="lg" onClick={handleConnect} disabled={joinVoice.isPending}>
            {joinVoice.isPending ? 'Connecting...' : 'Connect to Voice'}
          </Button>
        ) : (
          <>
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="icon"
              className="h-12 w-12"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              variant={isDeafened ? 'destructive' : 'secondary'}
              size="icon"
              className="h-12 w-12"
              onClick={() => setIsDeafened(!isDeafened)}
            >
              {isDeafened ? <HeadphoneOff className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-12 w-12"
              onClick={handleDisconnect}
              disabled={leaveVoice.isPending}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface ParticipantRowProps {
  participant: { userId: any; joinedAt: bigint };
}

function ParticipantRow({ participant }: ParticipantRowProps) {
  const { data: profile } = useGetUserProfile(participant.userId);

  const principalStr = participant.userId.toString();
  const avatarIndex = (principalStr.charCodeAt(0) % 6) + 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  const userName = profile?.name || principalStr.slice(0, 8);
  const avatarUrl = profile?.avatarUrl || defaultAvatar;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{userName}</span>
      </div>
      <div className="flex items-center gap-2 w-32">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider defaultValue={[100]} max={100} step={1} className="flex-1" />
      </div>
    </div>
  );
}
