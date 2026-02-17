import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetServerMembersWithUsernames, useGetUserProfileByUsername } from '../../hooks/useQueries';
import { useNavigation } from '../../state/navigation';

interface MemberListPanelProps {
  serverId: bigint;
}

function MemberRow({ username, userId }: { username: string; userId: string }) {
  const { data: profile } = useGetUserProfileByUsername(username);
  const { setSelectedMemberId } = useNavigation();

  const handleClick = () => {
    setSelectedMemberId(userId);
  };

  const avatarIndex = username ? (username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6) + 1 : 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-accent/50 transition-colors w-full text-left"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatarUrl || defaultAvatar} />
        <AvatarFallback>{profile?.name?.charAt(0) || username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm truncate">{profile?.name || username}</span>
    </button>
  );
}

export default function MemberListPanel({ serverId }: MemberListPanelProps) {
  const { data: membersData = [], isLoading } = useGetServerMembersWithUsernames(serverId);

  if (isLoading) {
    return (
      <div className="w-60 border-l border-border bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="w-60 border-l border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Members — {membersData.length}</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {membersData.map((memberData) => (
            <MemberRow 
              key={memberData.username} 
              username={memberData.username}
              userId={memberData.member.userId.toString()}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
