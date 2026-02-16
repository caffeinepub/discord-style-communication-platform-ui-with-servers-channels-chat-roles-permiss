import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetServerRoles, useAssignRoleToUser, useRemoveRoleFromUser } from '@/hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { sanitizeRoleColor } from '@/utils/roleColor';
import type { Role } from '@/types/local';
import { Principal } from '@dfinity/principal';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: bigint;
  userId: string;
  currentRoleIds: bigint[];
}

export default function RoleAssignmentDialog({
  open,
  onOpenChange,
  serverId,
  userId,
  currentRoleIds,
}: RoleAssignmentDialogProps) {
  const { data: roles = [], isLoading } = useGetServerRoles(serverId);
  const assignRole = useAssignRoleToUser();
  const removeRole = useRemoveRoleFromUser();

  const [pendingRoles, setPendingRoles] = useState<Set<bigint>>(new Set());

  const handleToggleRole = async (roleId: bigint, isCurrentlyAssigned: boolean) => {
    setPendingRoles((prev) => new Set(prev).add(roleId));

    try {
      const userPrincipal = Principal.fromText(userId);
      if (isCurrentlyAssigned) {
        await removeRole.mutateAsync({ serverId, userId: userPrincipal, roleId });
      } else {
        await assignRole.mutateAsync({ serverId, userId: userPrincipal, roleId });
      }
    } finally {
      setPendingRoles((prev) => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Roles</DialogTitle>
          <DialogDescription>
            Assign or remove roles for this member
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : roles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No roles available
          </p>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-4">
              {roles.map((role: Role) => {
                const isAssigned = currentRoleIds.some((id) => id === role.id);
                const isPending = pendingRoles.has(role.id);
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
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      {sanitizedColor && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sanitizedColor }}
                        />
                      )}
                      <span>{role.name}</span>
                      {isPending && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
                    </Label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
