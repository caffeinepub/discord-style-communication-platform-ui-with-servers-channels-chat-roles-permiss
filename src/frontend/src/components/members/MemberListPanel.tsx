import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../../state/navigation';
import { useGetServerMembersWithUsernames, useGetUserProfile } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ServerMemberWithUsername } from '@/types/backend-extended';

export default function MemberListPanel() {
  const { selectedServerId, setSelectedMemberId } = useNavigation();
  const { data: membersWithUsernames = [] } = useGetServerMembersWithUsernames(selectedServerId);

  return (
    <div className="flex w-60 flex-col bg-[oklch(0.21_0.01_250)] border-l border-border">
      <div className="flex h-12 items-center px-4 border-b border-border">
        <h3 className="text-sm font-semibold">Members — {membersWithUsernames.length}</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {membersWithUsernames.map((memberData) => (
            <MemberRow
              key={memberData.member.userId.toString()}
              memberData={memberData}
              onSelect={setSelectedMemberId}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface MemberRowProps {
  memberData: ServerMemberWithUsername;
  onSelect: (memberId: string) => void;
}

function MemberRow({ memberData, onSelect }: MemberRowProps) {
  const { data: profile } = useGetUserProfile(memberData.member.userId);

  const principalStr = memberData.member.userId.toString();
  const avatarIndex = (principalStr.charCodeAt(0) % 6) + 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  const displayName = profile?.name || memberData.username || principalStr.slice(0, 8);
  const avatarUrl = profile?.avatarUrl || defaultAvatar;

  return (
    <button
      onClick={() => onSelect(principalStr)}
      className="flex w-full items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 transition-colors text-left"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-xs">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm truncate">{displayName}</span>
    </button>
  );
}
