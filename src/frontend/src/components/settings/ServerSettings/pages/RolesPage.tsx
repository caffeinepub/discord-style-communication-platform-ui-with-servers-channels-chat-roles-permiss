import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/state/navigation';
import { useGetRoles, useAddRoleToServer } from '@/hooks/useQueries';
import { Plus } from 'lucide-react';
import { sanitizeRoleColor } from '@/utils/roleColor';
import RoleMemberAssignmentPanel from '../components/RoleMemberAssignmentPanel';

export default function RolesPage() {
  const { selectedServerId } = useNavigation();
  const { data: roles = [] } = useGetRoles(selectedServerId);
  const addRole = useAddRoleToServer();
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#5865F2');

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServerId || !newRoleName.trim()) return;

    try {
      await addRole.mutateAsync({
        serverId: selectedServerId,
        name: newRoleName.trim(),
        color: newRoleColor,
        permissions: [],
      });
      setNewRoleName('');
      setNewRoleColor('#5865F2');
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Roles</h2>
        <p className="text-muted-foreground">
          Manage server roles and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Role</CardTitle>
          <CardDescription>Add a new role to your server</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRole} className="space-y-4">
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
            <Button type="submit" disabled={!newRoleName.trim() || addRole.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              {addRole.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Roles</CardTitle>
          <CardDescription>Roles in this server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roles.map((role) => {
              const sanitizedColor = sanitizeRoleColor(role.color);
              return (
                <div
                  key={role.id.toString()}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  {sanitizedColor && (
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: sanitizedColor }}
                    />
                  )}
                  <span className="font-medium">{role.name}</span>
                </div>
              );
            })}
            {roles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No roles created yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedServerId && <RoleMemberAssignmentPanel serverId={selectedServerId} />}
    </div>
  );
}
