import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetUsernameForUser, useGetUserProfileByUsername } from '../../hooks/useQueries';
import type { TextChannelMessage } from '../../types/backend-extended';
import { useNavigation } from '../../state/navigation';

interface MessageItemProps {
  message: TextChannelMessage;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { data: username } = useGetUsernameForUser(message.createdBy);
  const { data: profile } = useGetUserProfileByUsername(username || null);
  const { setSelectedMemberId } = useNavigation();

  const timestamp = new Date(Number(message.createdAt) / 1_000_000);
  const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleProfileClick = () => {
    setSelectedMemberId(message.createdBy.toString());
  };

  const avatarIndex = username ? (username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6) + 1 : 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  return (
    <div className="flex gap-3 px-4 py-2 hover:bg-accent/30 group">
      <button onClick={handleProfileClick} className="flex-shrink-0">
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={profile?.avatarUrl || defaultAvatar} />
          <AvatarFallback>{profile?.name?.charAt(0) || username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
        </Avatar>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <button
            onClick={handleProfileClick}
            className="font-semibold hover:underline cursor-pointer"
          >
            {profile?.name || username || 'Unknown User'}
          </button>
          <span className="text-xs text-muted-foreground">{timeString}</span>
        </div>
        <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
