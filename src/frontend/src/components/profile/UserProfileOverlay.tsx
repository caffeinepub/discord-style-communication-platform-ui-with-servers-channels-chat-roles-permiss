import { useState } from 'react';
import { useNavigation } from '@/state/navigation';
import { useGetUserProfile, useGetUsernameForUser, useGetServerMembers, useGetServerRoles, useIsCallerAdmin, useGetServer } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { sanitizeRoleColor } from '@/utils/roleColor';
import RoleAssignmentDialog from './RoleAssignmentDialog';
import type { Role } from '@/backend';

export default function UserProfileOverlay() {
  const { selectedMemberId, selectedServerId, setSelectedMemberId } = useNavigation();
  const { identity } = useInternetIdentity();
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const userId = selectedMemberId ? Principal.fromText(selectedMemberId) : null;
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(userId);
  const { data: username, isLoading: usernameLoading } = useGetUsernameForUser(userId);
  
  // Server context data
  const { data: server } = useGetServer(selectedServerId);
  const { data: members = [] } = useGetServerMembers(selectedServerId);
  const { data: roles = [] } = useGetServerRoles(selectedServerId);
  const { data: isCallerAdmin = false } = useIsCallerAdmin();

  const isOpen = !!selectedMemberId;

  const handleClose = () => {
    setSelectedMemberId(null);
    setShowRoleDialog(false);
  };

  // Generate consistent avatar and banner
  const avatarIndex = selectedMemberId
    ? (parseInt(selectedMemberId.slice(-2), 16) % 6) + 1
    : 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;
  const defaultBanner = '/assets/generated/profile-banner-default.dim_1200x400.png';

  const avatarUrl = profile?.avatarUrl || defaultAvatar;
  const bannerUrl = profile?.bannerUrl || defaultBanner;
  const displayName = profile?.name || 'User';
  const aboutMe = profile?.aboutMe || '';
  const customStatus = profile?.customStatus || '';
  const badges = profile?.badges || [];

  const isLoading = profileLoading || usernameLoading;

  // Get member's roles in this server
  const member = members.find(m => m.userId.toString() === selectedMemberId);
  const memberRoleIds = member?.roles || [];
  const memberRoles: Role[] = memberRoleIds
    .map(roleId => roles.find(r => r.id === roleId))
    .filter((r): r is Role => r !== undefined);

  // Check if current user can manage roles
  const isServerOwner = server && identity ? server.owner.toString() === identity.getPrincipal().toString() : false;
  const canManageRoles = selectedServerId !== null && (isCallerAdmin || isServerOwner);
  const isViewingSelf = identity && selectedMemberId === identity.getPrincipal().toString();

  const content = (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="relative w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        <img
          src={bannerUrl}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Content */}
      <div className="px-4 pb-4">
        {/* Avatar overlapping banner */}
        <div className="relative -mt-12 mb-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-2xl">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        {/* Display Name */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">{displayName}</h2>
          {username && (
            <p className="text-sm text-muted-foreground">@{username}</p>
          )}
          {!username && !usernameLoading && (
            <p className="text-sm text-muted-foreground italic">No username set</p>
          )}
        </div>

        {/* User ID */}
        {selectedMemberId && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold mb-1 uppercase text-muted-foreground">User ID</h3>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {selectedMemberId}
            </p>
          </div>
        )}

        {/* Roles Section (only in server context) */}
        {selectedServerId !== null && memberRoles.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Roles</h3>
              {canManageRoles && !isViewingSelf && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRoleDialog(true)}
                  className="h-6 px-2"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {memberRoles.map((role) => {
                const roleColor = sanitizeRoleColor(role.color);
                return (
                  <Badge
                    key={role.id.toString()}
                    variant="secondary"
                    className="flex items-center gap-1.5"
                  >
                    {roleColor && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: roleColor }}
                      />
                    )}
                    <span>{role.name}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Role Management Button (when no roles but can manage) */}
        {selectedServerId !== null && memberRoles.length === 0 && canManageRoles && !isViewingSelf && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleDialog(true)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Roles
            </Button>
          </div>
        )}

        {/* Custom Status */}
        {customStatus && (
          <div className="mb-4 p-3 bg-accent/30 rounded-lg">
            <p className="text-sm">{customStatus}</p>
          </div>
        )}

        {/* About Me */}
        {aboutMe && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 uppercase text-muted-foreground">About Me</h3>
            <p className="text-sm whitespace-pre-wrap">{aboutMe}</p>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 uppercase text-muted-foreground">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading profile...</p>
          </div>
        )}
      </div>

      {/* Role Assignment Dialog */}
      {selectedServerId !== null && userId && canManageRoles && !isViewingSelf && (
        <RoleAssignmentDialog
          open={showRoleDialog}
          onOpenChange={setShowRoleDialog}
          serverId={selectedServerId}
          userId={userId}
          currentRoleIds={memberRoleIds}
        />
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="sr-only">
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
