import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../../state/navigation';
import { useGetServerMembersWithUsernames, useGetUserProfile, useGetMemberDisplayColor } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { sanitizeRoleColor } from '@/utils/roleColor';
import type { ServerMemberWithUsername } from '@/backend';

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
              serverId={selectedServerId}
              onClick={() => setSelectedMemberId(memberData.member.userId.toString())}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function MemberRow({ 
  memberData, 
  serverId,
  onClick 
}: { 
  memberData: ServerMemberWithUsername;
  serverId: bigint | null;
  onClick: () => void;
}) {
  const { data: profile } = useGetUserProfile(memberData.member.userId);
  const { data: roleColor } = useGetMemberDisplayColor(serverId, memberData.member.userId);
  
  const avatarIndex = (parseInt(memberData.member.userId.toString().slice(-2), 16) % 6) + 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  const displayName = profile?.name || memberData.username || 'User';
  
  // Sanitize and apply role color
  const sanitizedColor = sanitizeRoleColor(roleColor);
  const nameStyle = sanitizedColor ? { color: sanitizedColor } : undefined;

  return (
    <button
      className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatarUrl || defaultAvatar} />
        <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="text-sm truncate" style={nameStyle}>
        {displayName}
      </span>
    </button>
  );
}
