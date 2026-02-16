import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigation } from '../../../../state/navigation';
import { useGetRoles, useAddRole, useSetRolePermissions } from '../../../../hooks/useQueries';
import { Plus, Loader2 } from 'lucide-react';
import type { Permission } from '../../../../backend';

const AVAILABLE_PERMISSIONS = [
  { name: 'administrator', label: 'Administrator' },
  { name: 'manage_channels', label: 'Manage Channels' },
  { name: 'manage_roles', label: 'Manage Roles' },
  { name: 'kick_members', label: 'Kick Members' },
  { name: 'ban_members', label: 'Ban Members' },
  { name: 'moderate_messages', label: 'Moderate Messages' },
  { name: 'manage_webhooks', label: 'Manage Webhooks' },
  { name: 'create_invites', label: 'Create Invites' },
  { name: 'manage_events', label: 'Manage Events' },
];

export default function RolesPage() {
  const { selectedServerId } = useNavigation();
  const { data: roles = [] } = useGetRoles(selectedServerId);
  const addRole = useAddRole();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#5865F2');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const handleCreateRole = async () => {
    if (!selectedServerId || !newRoleName.trim()) return;

    const permissions: Permission[] = AVAILABLE_PERMISSIONS.map((p) => ({
      name: p.name,
      value: selectedPermissions.has(p.name),
    }));

    await addRole.mutateAsync({
      serverId: selectedServerId,
      name: newRoleName.trim(),
      color: newRoleColor,
      permissions,
    });

    setNewRoleName('');
    setNewRoleColor('#5865F2');
    setSelectedPermissions(new Set());
    setShowCreateDialog(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Roles</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="space-y-2">
        {roles.map((role) => (
          <div
            key={role.id.toString()}
            className="flex items-center justify-between p-4 rounded-lg bg-accent/30"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: role.color }}
              />
              <span className="font-medium">{role.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {role.permissions.filter((p) => p.value).length} permissions
            </span>
          </div>
        ))}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="New Role"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-color">Role Color</Label>
              <Input
                id="role-color"
                type="color"
                value={newRoleColor}
                onChange={(e) => setNewRoleColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div key={perm.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={perm.name}
                      checked={selectedPermissions.has(perm.name)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedPermissions);
                        if (checked) {
                          newSet.add(perm.name);
                        } else {
                          newSet.delete(perm.name);
                        }
                        setSelectedPermissions(newSet);
                      }}
                    />
                    <Label htmlFor={perm.name} className="font-normal cursor-pointer">
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRoleName.trim() || addRole.isPending}>
              {addRole.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
