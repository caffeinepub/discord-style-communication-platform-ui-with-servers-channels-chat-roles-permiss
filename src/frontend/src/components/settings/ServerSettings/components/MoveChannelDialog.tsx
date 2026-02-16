import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetCategories, useMoveChannelToCategory } from '../../../../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import type { ChannelCategory } from '../../../../types/local';

interface MoveChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: bigint;
  sourceCategoryId: bigint;
  channelId: bigint;
  channelName: string;
  isTextChannel: boolean;
}

export default function MoveChannelDialog({
  open,
  onOpenChange,
  serverId,
  sourceCategoryId,
  channelId,
  channelName,
  isTextChannel,
}: MoveChannelDialogProps) {
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategories(serverId);
  const moveChannel = useMoveChannelToCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCategoryId) return;

    try {
      await moveChannel.mutateAsync({
        serverId,
        sourceCategoryId,
        targetCategoryId: BigInt(targetCategoryId),
        channelId,
        isTextChannel,
        position: null,
      });

      setTargetCategoryId('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to move channel:', error);
    }
  };

  // Filter out the source category
  const availableCategories = categories.filter((cat: ChannelCategory) => cat.id !== sourceCategoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Channel</DialogTitle>
          <DialogDescription>
            Move "{channelName}" to a different category
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-category">Target Category</Label>
            <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
              <SelectTrigger id="target-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading categories...</div>
                ) : availableCategories.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No other categories available</div>
                ) : (
                  availableCategories.map((category: ChannelCategory) => (
                    <SelectItem key={category.id.toString()} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!targetCategoryId || moveChannel.isPending}>
              {moveChannel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                'Move Channel'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
