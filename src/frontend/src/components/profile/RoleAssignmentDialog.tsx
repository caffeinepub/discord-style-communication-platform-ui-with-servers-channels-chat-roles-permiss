import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useGetRoles, useAssignRoleToMember, useRemoveRoleFromMember } from '../../hooks/useQueries';
import { sanitizeRoleColor } from '../../utils/roleColor';
import type { Principal } from '@dfinity/principal';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  userId: Principal;
  currentRoles: string[];
}

export default function RoleAssignmentDialog({
  open,
  onOpenChange,
  serverId,
  userId,
  currentRoles,
}: RoleAssignmentDialogProps) {
  const { data: roles = [] } = useGetRoles(serverId);
  const assignRole = useAssignRoleToMember();
  const removeRole = useRemoveRoleFromMember();

  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());

  const handleToggleRole = async (roleId: string, isCurrentlyAssigned: boolean) => {
    setPendingChanges(prev => new Set(prev).add(roleId));
    
    try {
      if (isCurrentlyAssigned) {
        await removeRole.mutateAsync({ serverId, userId, roleId });
      } else {
        await assignRole.mutateAsync({ serverId, userId, roleId });
      }
    } finally {
      setPendingChanges(prev => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Roles</DialogTitle>
          <DialogDescription>
            Assign or remove roles for this member
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No roles available
            </p>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                const isAssigned = currentRoles.includes(role.id);
                const isPending = pendingChanges.has(role.id);
                const roleColor = sanitizeRoleColor(role.color);

                return (
                  <div key={role.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={isAssigned}
                      onCheckedChange={() => handleToggleRole(role.id, isAssigned)}
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      {roleColor && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: roleColor }}
                        />
                      )}
                      <span>{role.name}</span>
                      {isPending && (
                        <span className="text-xs text-muted-foreground">(updating...)</span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
