import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../../state/navigation';
import { useGetUsernameForUser, useGetUserProfileByUsername, useGetRoles, useIsCallerAdmin } from '../../hooks/useQueries';
import { useState } from 'react';
import RoleAssignmentDialog from './RoleAssignmentDialog';
import { sanitizeRoleColor } from '../../utils/roleColor';
import type { Principal } from '@dfinity/principal';

interface UserProfileOverlayProps {
  userId: Principal;
  serverId?: bigint | null;
}

export default function UserProfileOverlay({ userId, serverId }: UserProfileOverlayProps) {
  const { setSelectedMemberId } = useNavigation();
  const { data: username } = useGetUsernameForUser(userId);
  const { data: profile, isLoading: profileLoading } = useGetUserProfileByUsername(username || null);
  const { data: roles = [] } = useGetRoles(serverId || null);
  const { data: isAdmin = false } = useIsCallerAdmin();
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const handleClose = () => {
    setSelectedMemberId(null);
  };

  const avatarIndex = username ? (username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6) + 1 : 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;
  const defaultBanner = '/assets/generated/profile-banner-default.dim_1200x400.png';

  // Get user's roles in this server (if serverId is provided)
  const userRoles = serverId ? roles.filter(role => {
    // This would need backend support to get user's roles
    // For now, return empty array
    return false;
  }) : [];

  const canManageRoles = isAdmin && serverId;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={handleClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col">
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
          <img
            src={profile?.bannerUrl || defaultBanner}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-background/80 hover:bg-background"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 -mt-12 relative z-10">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={profile?.avatarUrl || defaultAvatar} />
            <AvatarFallback className="text-2xl">
              {profile?.name?.charAt(0) || username?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{profile?.name || username || 'Unknown User'}</h2>
              <p className="text-sm text-muted-foreground">@{username || 'unknown'}</p>
            </div>

            {profile?.customStatus && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Status</h3>
                <p className="text-sm">{profile.customStatus}</p>
              </div>
            )}

            {profile?.aboutMe && (
              <div>
                <h3 className="text-sm font-semibold mb-2">About Me</h3>
                <p className="text-sm whitespace-pre-wrap">{profile.aboutMe}</p>
              </div>
            )}

            {serverId && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">Server Roles</h3>
                  {canManageRoles && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRoleDialog(true)}
                    >
                      Manage Roles
                    </Button>
                  )}
                </div>
                {userRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((role) => {
                      const roleColor = sanitizeRoleColor(role.color);
                      return (
                        <Badge
                          key={role.id.toString()}
                          variant="secondary"
                          style={roleColor ? {
                            backgroundColor: roleColor,
                            color: 'white',
                          } : undefined}
                        >
                          {role.name}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No roles assigned</p>
                )}
              </div>
            )}

            {profile?.badges && profile.badges.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, index) => (
                    <Badge key={index} variant="outline">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {serverId && (
        <RoleAssignmentDialog
          open={showRoleDialog}
          onOpenChange={setShowRoleDialog}
          serverId={serverId}
          userId={userId}
          currentRoleIds={userRoles.map(r => r.id)}
        />
      )}
    </>
  );
}
