import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2 } from 'lucide-react';
import { useGetMembersWithRoles } from '@/hooks/useQueries';
import RoleAssignmentDialog from '../../../profile/RoleAssignmentDialog';
import { sanitizeRoleColor } from '@/utils/roleColor';
import type { ServerMemberInfo } from '@/types/local';

interface RoleMemberAssignmentPanelProps {
  serverId: bigint;
}

export default function RoleMemberAssignmentPanel({ serverId }: RoleMemberAssignmentPanelProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const { data: membersWithRoles, isLoading } = useGetMembersWithRoles(serverId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!membersWithRoles || membersWithRoles.members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No members found</p>
      </div>
    );
  }

  const selectedMember = membersWithRoles.members.find(
    (m: ServerMemberInfo) => m.member.userId === selectedMemberId
  );

  const memberRoles = selectedMember
    ? membersWithRoles.roles.filter((r) => selectedMember.member.roles.includes(r.id))
    : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="member-select">Select Member</Label>
        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
          <SelectTrigger id="member-select">
            <SelectValue placeholder="Choose a member" />
          </SelectTrigger>
          <SelectContent>
            {membersWithRoles.members.map((memberInfo: ServerMemberInfo) => (
              <SelectItem key={memberInfo.member.userId} value={memberInfo.member.userId}>
                {memberInfo.username || memberInfo.member.userId.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMember && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedMember.username || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {selectedMember.member.userId.slice(0, 16)}...
              </p>
            </div>
            <Button size="sm" onClick={() => setRoleDialogOpen(true)}>
              <Shield className="h-4 w-4 mr-1" />
              Manage Roles
            </Button>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Current Roles</Label>
            {memberRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {memberRoles.map((role) => {
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
              <p className="text-sm text-muted-foreground mt-2">No roles assigned</p>
            )}
          </div>
        </div>
      )}

      {selectedMemberId && (
        <RoleAssignmentDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          serverId={serverId}
          userId={selectedMemberId}
          currentRoleIds={selectedMember?.member.roles || []}
        />
      )}
    </div>
  );
}
