import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGetMembersWithRoles } from '../../../../hooks/useQueries';
import { sanitizeRoleColor } from '../../../../utils/roleColor';
import RoleAssignmentDialog from '../../../profile/RoleAssignmentDialog';

interface RoleMemberAssignmentPanelProps {
  serverId: string;
}

export default function RoleMemberAssignmentPanel({ serverId }: RoleMemberAssignmentPanelProps) {
  const { data, isLoading } = useGetMembersWithRoles(serverId);
  const [selectedMemberUsername, setSelectedMemberUsername] = useState<string>('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading members...</div>;
  }

  const members = data?.members || [];
  const roles = data?.roles || [];

  const selectedMember = members.find(m => m.username === selectedMemberUsername);

  return (
    <div className="space-y-4 border border-border rounded-lg p-4">
      <h3 className="font-semibold">Assign Roles to Members</h3>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="member-select">Select Member</Label>
          <Select value={selectedMemberUsername} onValueChange={setSelectedMemberUsername}>
            <SelectTrigger id="member-select">
              <SelectValue placeholder="Choose a member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((memberInfo) => (
                <SelectItem key={memberInfo.username} value={memberInfo.username}>
                  {memberInfo.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMember && (
          <div className="space-y-3 p-3 border border-border rounded-lg bg-accent/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedMember.username}</span>
              <Button size="sm" onClick={() => setRoleDialogOpen(true)}>
                Manage Roles
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedMember.member.roles.length === 0 ? (
                <span className="text-sm text-muted-foreground">No roles assigned</span>
              ) : (
                selectedMember.member.roles.map((roleId) => {
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
                })
              )}
            </div>
          </div>
        )}
      </div>

      {selectedMember && (
        <RoleAssignmentDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          serverId={serverId}
          userId={selectedMember.member.userId}
          currentRoles={selectedMember.member.roles}
        />
      )}
    </div>
  );
}
