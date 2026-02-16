import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useNavigation } from '../../../../state/navigation';
import { useGetRoles, useAddRoleToServer } from '../../../../hooks/useQueries';
import { sanitizeRoleColor } from '@/utils/roleColor';
import RoleMemberAssignmentPanel from '../components/RoleMemberAssignmentPanel';
import type { Permission } from '../../../../types/backend-extended';

export default function RolesPage() {
  const { selectedServerId } = useNavigation();
  const { data: roles = [], isLoading } = useGetRoles(selectedServerId);
  const addRole = useAddRoleToServer();

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#5865F2');

  const handleCreateRole = async () => {
    if (!selectedServerId || !newRoleName.trim()) return;

    const permissions: Permission[] = [];

    try {
      await addRole.mutateAsync({
        serverId: selectedServerId,
        roleName: newRoleName.trim(),
        color: newRoleColor,
        permissions,
      });
      setNewRoleName('');
      setNewRoleColor('#5865F2');
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  if (!selectedServerId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No server selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Roles</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage roles and permissions for your server
        </p>
      </div>

      <Separator />

      {/* Create New Role */}
      <div className="space-y-4 p-4 border border-border rounded-lg">
        <h3 className="text-lg font-semibold">Create New Role</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g., Moderator"
              maxLength={50}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-color">Role Color</Label>
            <div className="flex gap-2">
              <Input
                id="role-color"
                type="color"
                value={newRoleColor}
                onChange={(e) => setNewRoleColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={newRoleColor}
                onChange={(e) => setNewRoleColor(e.target.value)}
                placeholder="#5865F2"
                className="flex-1"
              />
            </div>
          </div>
          <Button
            onClick={handleCreateRole}
            disabled={!newRoleName.trim() || addRole.isPending}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addRole.isPending ? 'Creating...' : 'Create Role'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Existing Roles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Roles</h3>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading roles...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No roles created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => {
              const roleColor = sanitizeRoleColor(role.color);
              return (
                <div
                  key={role.id.toString()}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {roleColor && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: roleColor }}
                      />
                    )}
                    <span className="font-medium">{role.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      Position: {role.position.toString()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* Member Role Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Assign Roles to Members</h3>
        <RoleMemberAssignmentPanel serverId={selectedServerId} />
      </div>
    </div>
  );
}
