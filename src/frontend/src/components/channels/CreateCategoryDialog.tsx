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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddCategory } from '../../hooks/useQueries';
import { useBackendActionGuard } from '@/hooks/useBackendActionGuard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: bigint;
}

export default function CreateCategoryDialog({
  open,
  onOpenChange,
  serverId,
}: CreateCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState('');
  const addCategory = useAddCategory();
  const { disabled: backendDisabled, reason: backendReason } = useBackendActionGuard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || backendDisabled) return;

    try {
      await addCategory.mutateAsync({
        serverId,
        categoryName: categoryName.trim(),
      });
      setCategoryName('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCategoryName('');
    }
    onOpenChange(newOpen);
  };

  const isSubmitDisabled = !categoryName.trim() || addCategory.isPending || backendDisabled;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your channels.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., General, Gaming, Music"
                maxLength={50}
                autoFocus
                disabled={backendDisabled}
              />
            </div>
            {backendDisabled && backendReason && (
              <p className="text-sm text-muted-foreground">{backendReason}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={addCategory.isPending}
            >
              Cancel
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button type="submit" disabled={isSubmitDisabled}>
                    {addCategory.isPending ? 'Creating...' : 'Create Category'}
                  </Button>
                </span>
              </TooltipTrigger>
              {backendDisabled && backendReason && (
                <TooltipContent>{backendReason}</TooltipContent>
              )}
            </Tooltip>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
