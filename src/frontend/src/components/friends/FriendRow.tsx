import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, MessageCircle, Phone } from 'lucide-react';
import { useGetUserProfile } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';

interface FriendRowProps {
  friendId: Principal;
}

export default function FriendRow({ friendId }: FriendRowProps) {
  const { data: profile } = useGetUserProfile(friendId);
  const avatarIndex = (parseInt(friendId.toString().slice(-2), 16) % 6) + 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatarUrl || defaultAvatar} />
          <AvatarFallback>{profile?.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile?.name || 'User'}</p>
          {profile?.customStatus && (
            <p className="text-xs text-muted-foreground">{profile.customStatus}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Phone className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Remove Friend</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
