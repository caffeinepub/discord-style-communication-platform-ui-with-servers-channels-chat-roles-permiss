import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useGetServerMembersWithRoles } from '@/hooks/useQueries';
import { sanitizeRoleColor } from '@/utils/roleColor';
import RoleAssignmentDialog from '@/components/profile/RoleAssignmentDialog';
import type { ServerMemberInfo } from '@/backend';

interface RoleMemberAssignmentPanelProps {
  serverId: bigint;
}

export default function RoleMemberAssignmentPanel({ serverId }: RoleMemberAssignmentPanelProps) {
  const { data, isLoading } = useGetServerMembersWithRoles(serverId);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const members = data?.members || [];
  const roles = data?.roles || [];

  const selectedMember = members.find(m => m.member.userId.toString() === selectedMemberId);

  const getMemberRoles = (member: ServerMemberInfo) => {
    return member.member.roles
      .map(roleId => roles.find(r => r.id === roleId))
      .filter((role): role is NonNullable<typeof role> => role !== undefined);
  };

  const handleManageRoles = () => {
    if (selectedMember) {
      setShowRoleDialog(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="member-select">Select Member</Label>
        <Select value={selectedMemberId || ''} onValueChange={setSelectedMemberId}>
          <SelectTrigger id="member-select">
            <SelectValue placeholder="Choose a member to manage roles" />
          </SelectTrigger>
          <SelectContent>
            {members.map((memberInfo) => (
              <SelectItem
                key={memberInfo.member.userId.toString()}
                value={memberInfo.member.userId.toString()}
              >
                {memberInfo.username || memberInfo.member.userId.toString().slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMember && (
        <div className="space-y-4 p-4 rounded-lg border border-border bg-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">
                {selectedMember.username || 'Unknown User'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedMember.member.userId.toString().slice(0, 16)}...
              </p>
            </div>
            <Button onClick={handleManageRoles} size="sm">
              <Users className="mr-2 h-4 w-4" />
              Manage Roles
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Current Roles</Label>
            <div className="flex flex-wrap gap-2">
              {getMemberRoles(selectedMember).length > 0 ? (
                getMemberRoles(selectedMember).map((role) => {
                  const roleColor = sanitizeRoleColor(role.color);
                  return (
                    <Badge
                      key={role.id.toString()}
                      variant="secondary"
                      className="gap-2"
                    >
                      {roleColor && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: roleColor }}
                        />
                      )}
                      {role.name}
                    </Badge>
                  );
                })
              ) : (
                <span className="text-sm text-muted-foreground">No roles assigned</span>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedMember && (
        <RoleAssignmentDialog
          open={showRoleDialog}
          onOpenChange={setShowRoleDialog}
          serverId={serverId}
          userId={selectedMember.member.userId}
          currentRoleIds={selectedMember.member.roles}
        />
      )}
    </div>
  );
}
