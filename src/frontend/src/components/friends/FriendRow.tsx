import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, MessageCircle, Phone } from 'lucide-react';
import { useGetUserProfileByUsername } from '../../hooks/useQueries';

interface FriendRowProps {
  username: string;
}

export default function FriendRow({ username }: FriendRowProps) {
  const { data: profile } = useGetUserProfileByUsername(username);
  
  // Generate a deterministic avatar index from the username
  const getAvatarIndex = (name: string): number => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    return (Math.abs(hash) % 6) + 1;
  };
  
  const avatarIndex = getAvatarIndex(username);
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatarUrl || defaultAvatar} />
          <AvatarFallback>{profile?.name?.charAt(0) || username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile?.name || username}</p>
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
