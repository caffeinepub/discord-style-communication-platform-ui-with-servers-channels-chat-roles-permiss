import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetServerMembersWithUsernames, useGetUserProfile } from '../../hooks/useQueries';
import { useNavigation } from '../../state/navigation';
import { Users } from 'lucide-react';
import type { ServerMemberWithUsername } from '@/types/local';
import { Principal } from '@dfinity/principal';

export default function MemberListPanel() {
  const { selectedServerId, setSelectedMemberId } = useNavigation();
  const { data: membersWithUsernames = [], isLoading } = useGetServerMembersWithUsernames(selectedServerId);

  if (!selectedServerId) {
    return null;
  }

  return (
    <div className="w-60 bg-secondary border-l border-border flex flex-col">
      <div className="h-12 border-b border-border flex items-center px-4">
        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Members</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {membersWithUsernames.length}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading members...</p>
          ) : membersWithUsernames.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No members</p>
          ) : (
            membersWithUsernames.map((item: ServerMemberWithUsername) => (
              <MemberRow
                key={item.member.userId}
                memberWithUsername={item}
                onSelect={setSelectedMemberId}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface MemberRowProps {
  memberWithUsername: ServerMemberWithUsername;
  onSelect: (memberId: string) => void;
}

function MemberRow({ memberWithUsername, onSelect }: MemberRowProps) {
  const { member, username } = memberWithUsername;
  const memberPrincipal = typeof member.userId === 'string' 
    ? Principal.fromText(member.userId) 
    : member.userId;
  const { data: profile } = useGetUserProfile(memberPrincipal);

  const principalStr = member.userId.toString();
  const avatarIndex = (principalStr.charCodeAt(0) % 6) + 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  const displayName = profile?.name || username || principalStr.slice(0, 8);
  const avatarUrl = profile?.avatarUrl || defaultAvatar;

  return (
    <button
      onClick={() => onSelect(principalStr)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent transition-colors text-left"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm truncate">{displayName}</span>
    </button>
  );
}
