import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../../state/navigation';
import { useGetUsernameForUser, useGetUserProfileByUsername, useGetRoles, useIsCallerAdmin } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { sanitizeRoleColor } from '../../utils/roleColor';
import { useState } from 'react';
import RoleAssignmentDialog from './RoleAssignmentDialog';

export default function UserProfileOverlay() {
  const { selectedMemberId, setSelectedMemberId, selectedServerId } = useNavigation();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const userId = selectedMemberId ? Principal.fromText(selectedMemberId) : null;
  const { data: username } = useGetUsernameForUser(userId);
  const { data: profile } = useGetUserProfileByUsername(username || null);
  const { data: roles = [] } = useGetRoles(selectedServerId);
  const { data: isAdmin } = useIsCallerAdmin();

  if (!selectedMemberId || !username) return null;

  const avatarIndex = username ? (username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6) + 1 : 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;
  const defaultBanner = '/assets/generated/profile-banner-default.dim_1200x400.png';

  // Get member roles - this would need to come from a backend query in a real app
  const memberRoles: string[] = [];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-lg">
        <ScrollArea className="h-full">
          <div className="relative">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 relative">
              <img
                src={profile?.bannerUrl || defaultBanner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 hover:bg-background"
                onClick={() => setSelectedMemberId(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Avatar */}
            <div className="px-6 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={profile?.avatarUrl || defaultAvatar} />
                <AvatarFallback>{profile?.name?.charAt(0) || username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{profile?.name || username}</h2>
                <p className="text-sm text-muted-foreground">@{username}</p>
              </div>

              {profile?.customStatus && (
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-sm">{profile.customStatus}</p>
                </div>
              )}

              {profile?.aboutMe && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">About Me</h3>
                  <p className="text-sm text-muted-foreground">{profile.aboutMe}</p>
                </div>
              )}

              {profile?.badges && profile.badges.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.map((badge, index) => (
                      <Badge key={index} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedServerId && memberRoles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Server Roles</h3>
                    {isAdmin && (
                      <Button size="sm" variant="outline" onClick={() => setRoleDialogOpen(true)}>
                        Manage
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {memberRoles.map((roleId) => {
                      const role = roles.find(r => r.id === roleId);
                      if (!role) return null;
                      
                      const roleColor = sanitizeRoleColor(role.color);
                      
                      return (
                        <Badge
                          key={roleId}
                          variant="secondary"
                          style={roleColor ? { backgroundColor: roleColor, color: '#fff' } : undefined}
                        >
                          {role.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {selectedServerId && userId && (
          <RoleAssignmentDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            serverId={selectedServerId}
            userId={userId}
            currentRoles={memberRoles}
          />
        )}
      </div>
    </div>
  );
}
