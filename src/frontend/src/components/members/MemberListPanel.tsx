import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../../state/navigation';
import { useGetServerMembers, useGetUserProfile } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MemberListPanel() {
  const { selectedServerId, setSelectedMemberId } = useNavigation();
  const { data: members = [] } = useGetServerMembers(selectedServerId);

  return (
    <div className="flex w-60 flex-col bg-[oklch(0.21_0.01_250)] border-l border-border">
      <div className="flex h-12 items-center px-4 border-b border-border">
        <h3 className="text-sm font-semibold">Members — {members.length}</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {members.map((member) => (
            <MemberRow
              key={member.userId.toString()}
              member={member}
              onClick={() => setSelectedMemberId(member.userId.toString())}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function MemberRow({ member, onClick }: { member: any; onClick: () => void }) {
  const { data: profile } = useGetUserProfile(member.userId);
  const avatarIndex = (parseInt(member.userId.toString().slice(-2), 16) % 6) + 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  return (
    <button
      className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatarUrl || defaultAvatar} />
        <AvatarFallback>{profile?.name?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>
      <span className="text-sm truncate">{profile?.name || 'User'}</span>
    </button>
  );
}
