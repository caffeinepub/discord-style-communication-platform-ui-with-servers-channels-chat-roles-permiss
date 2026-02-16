import { X, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigation } from '@/state/navigation';
import { useGetUserProfile, useGetServer, useIsCallerAdmin } from '@/hooks/useQueries';
import { useState } from 'react';
import RoleAssignmentDialog from './RoleAssignmentDialog';
import { sanitizeRoleColor } from '@/utils/roleColor';
import type { Role } from '@/types/local';
import { Principal } from '@dfinity/principal';

export default function UserProfileOverlay() {
  const { selectedMemberId, selectedServerId, setSelectedMemberId } = useNavigation();
  const memberPrincipal = selectedMemberId ? Principal.fromText(selectedMemberId) : null;
  const { data: profile, isLoading } = useGetUserProfile(memberPrincipal);
  const { data: server } = useGetServer(selectedServerId);
  const { data: isAdmin } = useIsCallerAdmin();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  if (!selectedMemberId) return null;

  const handleClose = () => {
    setSelectedMemberId(null);
  };

  // Generate a consistent avatar index
  const avatarIndex = (selectedMemberId.charCodeAt(0) % 6) + 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;
  const avatarUrl = profile?.avatarUrl || defaultAvatar;
  const bannerUrl = profile?.bannerUrl || '/assets/generated/profile-banner-default.dim_1200x400.png';
  const displayName = profile?.name || selectedMemberId.slice(0, 8);

  // Get member's roles in this server
  const member = server?.members.find((m) => m.userId === selectedMemberId);
  const memberRoles = member?.roles || [];
  const roles = server?.roles.filter((r: Role) => memberRoles.includes(r.id)) || [];

  // Check if current user can manage roles (admin or server owner)
  const canManageRoles = isAdmin || (server && server.owner === selectedMemberId);

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={handleClose} />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l border-border z-50 flex flex-col shadow-xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Close profile"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div
                className="h-24 bg-cover bg-center"
                style={{ backgroundImage: `url(${bannerUrl})` }}
              />
              <div className="px-4 pb-4">
                <Avatar className="h-20 w-20 border-4 border-background -mt-10 relative">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground font-mono">{selectedMemberId.slice(0, 16)}...</p>
              </div>

              {profile?.customStatus && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Status</h3>
                  <p className="text-sm">{profile.customStatus}</p>
                </div>
              )}

              {profile?.aboutMe && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">About Me</h3>
                  <p className="text-sm">{profile.aboutMe}</p>
                </div>
              )}

              {profile?.badges && profile.badges.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.map((badge, index) => (
                      <Badge key={index} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedServerId && server && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                        Roles in {server.name}
                      </h3>
                      {canManageRoles && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRoleDialogOpen(true)}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                    {roles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {roles.map((role: Role) => {
                          const sanitizedColor = sanitizeRoleColor(role.color);
                          return (
                            <Badge
                              key={role.id.toString()}
                              variant="outline"
                              style={
                                sanitizedColor
                                  ? {
                                      borderColor: sanitizedColor,
                                      color: sanitizedColor,
                                    }
                                  : undefined
                              }
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
                </>
              )}
            </div>
          </>
        )}
      </div>

      {selectedServerId && (
        <RoleAssignmentDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          serverId={selectedServerId}
          userId={selectedMemberId}
          currentRoleIds={memberRoles}
        />
      )}
    </>
  );
}
