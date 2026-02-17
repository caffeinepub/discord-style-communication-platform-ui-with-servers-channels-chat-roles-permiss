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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetCategories, useIsCallerAdmin } from '../../../../hooks/useQueries';
import type { Category } from '../../../../backend';

interface MoveChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  channelId: string;
  channelName: string;
  currentCategoryId: string;
  channelType: 'text' | 'voice';
}

export default function MoveChannelDialog({
  open,
  onOpenChange,
  serverId,
  channelId,
  channelName,
  currentCategoryId,
  channelType,
}: MoveChannelDialogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const { data: categories = [] } = useGetCategories(serverId);
  const { data: isAdmin } = useIsCallerAdmin();

  const availableCategories = categories.filter((cat) => cat.id !== currentCategoryId);

  const handleMove = async () => {
    if (!selectedCategoryId) return;
    // TODO: Implement move channel mutation
    console.log('Moving channel', { channelId, from: currentCategoryId, to: selectedCategoryId });
    onOpenChange(false);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Channel</DialogTitle>
          <DialogDescription>
            Move "{channelName}" to a different category
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">New Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedCategoryId}>
            Move Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
