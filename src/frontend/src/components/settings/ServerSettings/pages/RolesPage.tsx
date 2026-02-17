import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useNavigation } from '../../../../state/navigation';
import { useGetRoles, useAddRoleToServer } from '../../../../hooks/useQueries';
import { sanitizeRoleColor } from '../../../../utils/roleColor';
import RoleMemberAssignmentPanel from '../components/RoleMemberAssignmentPanel';

export function RolesPage() {
  const { selectedServerId } = useNavigation();
  const { data: roles = [] } = useGetRoles(selectedServerId);
  const addRole = useAddRoleToServer();

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#5865F2');

  const handleCreateRole = async () => {
    if (!selectedServerId || !newRoleName.trim()) return;

    const sanitizedColor = sanitizeRoleColor(newRoleColor);
    if (!sanitizedColor) return;

    try {
      await addRole.mutateAsync({
        serverId: selectedServerId,
        name: newRoleName.trim(),
        color: sanitizedColor,
      });
      setNewRoleName('');
      setNewRoleColor('#5865F2');
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-4">Roles</h2>
        <p className="text-sm text-muted-foreground">
          Create and manage roles for your server members
        </p>
      </div>

      <div className="space-y-4 border border-border rounded-lg p-4">
        <h3 className="font-semibold">Create New Role</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g., Moderator, VIP"
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
          <Button onClick={handleCreateRole} disabled={addRole.isPending || !newRoleName.trim()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {addRole.isPending ? 'Creating...' : 'Create Role'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Existing Roles</h3>
        {roles.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border border-border rounded-lg">
            <p>No roles yet</p>
            <p className="text-sm mt-2">Create a role to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {role.color && sanitizeRoleColor(role.color) && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: sanitizeRoleColor(role.color) || undefined }}
                    />
                  )}
                  <span className="font-medium">{role.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedServerId && <RoleMemberAssignmentPanel serverId={selectedServerId} />}
    </div>
  );
}
