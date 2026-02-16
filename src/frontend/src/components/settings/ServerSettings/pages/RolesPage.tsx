import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Loader2 } from 'lucide-react';
import { useGetServerRoles, useAddRole } from '../../../../hooks/useQueries';
import { useNavigation } from '../../../../state/navigation';
import RoleMemberAssignmentPanel from '../components/RoleMemberAssignmentPanel';
import type { Permission } from '../../../../types/local';

export default function RolesPage() {
  const { selectedServerId } = useNavigation();
  const { data: roles = [], isLoading } = useGetServerRoles(selectedServerId);
  const addRoleMutation = useAddRole();

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#5865F2');

  const handleCreateRole = async () => {
    if (!selectedServerId || !newRoleName.trim()) return;

    const defaultPermissions: Permission[] = [
      { name: 'view_channels', value: true },
      { name: 'send_messages', value: true },
      { name: 'read_message_history', value: true },
    ];

    try {
      await addRoleMutation.mutateAsync({
        serverId: selectedServerId,
        roleName: newRoleName.trim(),
        color: newRoleColor,
        permissions: defaultPermissions,
      });

      setNewRoleName('');
      setNewRoleColor('#5865F2');
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Roles</h3>
        <p className="text-sm text-muted-foreground">
          Manage roles and permissions for your server
        </p>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Create New Role</h4>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Moderator"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
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
            disabled={!newRoleName.trim() || addRoleMutation.isPending}
          >
            {addRoleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold">Existing Roles ({roles.length})</h4>
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No roles created yet</p>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id.toString()}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <span className="font-medium">{role.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-4">Assign Roles to Members</h4>
        {selectedServerId && <RoleMemberAssignmentPanel serverId={selectedServerId} />}
      </div>
    </div>
  );
}
