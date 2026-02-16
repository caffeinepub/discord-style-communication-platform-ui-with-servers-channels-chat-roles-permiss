import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetUserProfile } from '@/hooks/useQueries';
import { useNavigation } from '@/state/navigation';
import type { TextChannelMessage } from '@/backend';

interface MessageItemProps {
  message: TextChannelMessage;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { data: profile } = useGetUserProfile(message.createdBy);
  const { setSelectedMemberId } = useNavigation();

  // Generate a consistent avatar index based on the principal
  const principalStr = message.createdBy.toString();
  const avatarIndex = (principalStr.charCodeAt(0) % 6) + 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  const authorName = profile?.name || principalStr.slice(0, 8);
  const avatarUrl = profile?.avatarUrl || defaultAvatar;

  // Convert nanoseconds timestamp to milliseconds
  const timestamp = Number(message.createdAt) / 1_000_000;

  const handleAuthorClick = () => {
    setSelectedMemberId(message.createdBy.toString());
  };

  return (
    <div className="flex gap-3 hover:bg-accent/30 px-4 py-2 -mx-4 rounded transition-colors">
      <button
        onClick={handleAuthorClick}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        aria-label={`View ${authorName}'s profile`}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <button
            onClick={handleAuthorClick}
            className="font-semibold hover:underline cursor-pointer"
          >
            {authorName}
          </button>
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm mt-1 break-words">{message.content}</p>
      </div>
    </div>
  );
}
