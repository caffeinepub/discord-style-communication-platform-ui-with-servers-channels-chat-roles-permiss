import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { ChannelCategory } from '../../../../types/backend-extended';

interface MoveChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: bigint;
  channelName: string;
  isTextChannel: boolean;
  currentCategoryId: bigint;
  categories: ChannelCategory[];
  onMove: (targetCategoryId: bigint) => void;
  isPending?: boolean;
}

export default function MoveChannelDialog({
  open,
  onOpenChange,
  channelId,
  channelName,
  isTextChannel,
  currentCategoryId,
  categories,
  onMove,
  isPending = false,
}: MoveChannelDialogProps) {
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');

  const handleMove = () => {
    if (!targetCategoryId) return;
    onMove(BigInt(targetCategoryId));
    onOpenChange(false);
  };

  const availableCategories = categories.filter((cat) => cat.id !== currentCategoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {isTextChannel ? 'Text' : 'Voice'} Channel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Channel</Label>
            <div className="text-sm text-muted-foreground">{channelName}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-category">Move to Category</Label>
            <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
              <SelectTrigger id="target-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id.toString()} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableCategories.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No other categories available. Create a new category first.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!targetCategoryId || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moving...
              </>
            ) : (
              'Move Channel'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
