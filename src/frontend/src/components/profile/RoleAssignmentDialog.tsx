import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetServerRoles, useAssignRoleToUser, useRemoveRoleFromUser } from '@/hooks/useQueries';
import { sanitizeRoleColor } from '@/utils/roleColor';
import type { Role } from '@/backend';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: bigint;
  userId: Principal;
  currentRoleIds: bigint[];
}

export default function RoleAssignmentDialog({
  open,
  onOpenChange,
  serverId,
  userId,
  currentRoleIds,
}: RoleAssignmentDialogProps) {
  const { data: roles = [], isLoading: rolesLoading } = useGetServerRoles(serverId);
  const assignRole = useAssignRoleToUser();
  const removeRole = useRemoveRoleFromUser();
  
  const [pendingChanges, setPendingChanges] = useState<Set<bigint>>(new Set());

  const isRoleAssigned = (roleId: bigint): boolean => {
    return currentRoleIds.some(id => id === roleId);
  };

  const handleToggleRole = async (role: Role) => {
    const roleId = role.id;
    
    // Prevent multiple simultaneous changes to the same role
    if (pendingChanges.has(roleId)) return;
    
    setPendingChanges(prev => new Set(prev).add(roleId));
    
    try {
      if (isRoleAssigned(roleId)) {
        await removeRole.mutateAsync({ serverId, roleId, userId });
      } else {
        await assignRole.mutateAsync({ serverId, roleId, userId });
      }
    } finally {
      setPendingChanges(prev => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
    }
  };

  const isAnyPending = pendingChanges.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Roles</DialogTitle>
          <DialogDescription>
            Assign or remove roles for this member
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {rolesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No roles available in this server
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => {
                const roleColor = sanitizeRoleColor(role.color);
                const isAssigned = isRoleAssigned(role.id);
                const isPending = pendingChanges.has(role.id);

                return (
                  <div
                    key={role.id.toString()}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                  >
                    <Checkbox
                      checked={isAssigned}
                      onCheckedChange={() => handleToggleRole(role)}
                      disabled={isPending}
                      className="shrink-0"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {roleColor && (
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: roleColor }}
                        />
                      )}
                      <span className="text-sm font-medium truncate">
                        {role.name}
                      </span>
                    </div>
                    {isPending && (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAnyPending}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
