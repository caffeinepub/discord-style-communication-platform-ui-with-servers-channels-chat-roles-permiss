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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useCreateCategory } from '../../hooks/useQueries';
import { useBackendActionGuard } from '@/hooks/useBackendActionGuard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
}

export default function CreateCategoryDialog({
  open,
  onOpenChange,
  serverId,
}: CreateCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState('');
  const addCategory = useCreateCategory();
  const { disabled: backendDisabled, reason: backendReason } = useBackendActionGuard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || backendDisabled) return;

    try {
      await addCategory.mutateAsync({
        serverId,
        name: categoryName.trim(),
      });
      // Only close and reset on success
      setCategoryName('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError (toast)
      // Dialog stays open so user can see the error and retry
      console.error('Failed to create category:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !addCategory.isPending) {
      setCategoryName('');
      addCategory.reset();
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
            {addCategory.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {addCategory.error?.message || 'Failed to create category'}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., General, Gaming, Music"
                maxLength={50}
                autoFocus
                disabled={backendDisabled || addCategory.isPending}
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
