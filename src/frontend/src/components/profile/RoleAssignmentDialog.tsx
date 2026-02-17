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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetRoles, useAssignRoleToMember, useRemoveRoleFromMember } from '@/hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { sanitizeRoleColor } from '@/utils/roleColor';

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
  const { data: roles = [] } = useGetRoles(serverId);
  const assignRole = useAssignRoleToMember();
  const removeRole = useRemoveRoleFromMember();
  const [pendingRoles, setPendingRoles] = useState<Set<string>>(new Set());

  const handleToggleRole = async (roleId: bigint, isCurrentlyAssigned: boolean) => {
    const roleIdStr = roleId.toString();
    setPendingRoles((prev) => new Set(prev).add(roleIdStr));

    try {
      if (isCurrentlyAssigned) {
        await removeRole.mutateAsync({ serverId, userId, roleId });
      } else {
        await assignRole.mutateAsync({ serverId, userId, roleId });
      }
    } finally {
      setPendingRoles((prev) => {
        const next = new Set(prev);
        next.delete(roleIdStr);
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
            Assign or remove roles for this member.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 py-4">
            {roles.map((role) => {
              const isAssigned = currentRoleIds.some((id) => id === role.id);
              const isPending = pendingRoles.has(role.id.toString());
              const sanitizedColor = sanitizeRoleColor(role.color);

              return (
                <div key={role.id.toString()} className="flex items-center space-x-3">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={isAssigned}
                    onCheckedChange={() => handleToggleRole(role.id, isAssigned)}
                    disabled={isPending}
                  />
                  <Label
                    htmlFor={`role-${role.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {sanitizedColor && (
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sanitizedColor }}
                      />
                    )}
                    <span>{role.name}</span>
                  </Label>
                </div>
              );
            })}
            {roles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No roles available
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
