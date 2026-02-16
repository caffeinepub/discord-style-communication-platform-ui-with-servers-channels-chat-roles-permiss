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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddTextChannel, useAddVoiceChannel, useGetCategories } from '../../../../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { useBackendActionGuard } from '../../../../hooks/useBackendActionGuard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ChannelCategory } from '../../../../types/local';

interface CreateChannelInSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: bigint;
}

export default function CreateChannelInSettingsDialog({
  open,
  onOpenChange,
  serverId,
}: CreateChannelInSettingsDialogProps) {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const { data: categories = [], isLoading: categoriesLoading } = useGetCategories(serverId);
  const addTextChannel = useAddTextChannel();
  const addVoiceChannel = useAddVoiceChannel();
  const { disabled: actionDisabled, reason: actionDisabledReason } = useBackendActionGuard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !selectedCategoryId) return;

    const categoryId = BigInt(selectedCategoryId);

    try {
      if (channelType === 'text') {
        await addTextChannel.mutateAsync({
          serverId,
          categoryId,
          channelName: channelName.trim(),
        });
      } else {
        await addVoiceChannel.mutateAsync({
          serverId,
          categoryId,
          channelName: channelName.trim(),
        });
      }

      setChannelName('');
      setSelectedCategoryId('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const isFormValid = channelName.trim().length > 0 && selectedCategoryId.length > 0;
  const isSubmitDisabled = !isFormValid || addTextChannel.isPending || addVoiceChannel.isPending || actionDisabled;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Add a new text or voice channel to a category
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-type">Channel Type</Label>
            <Select value={channelType} onValueChange={(value: 'text' | 'voice') => setChannelType(value)}>
              <SelectTrigger id="channel-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Channel</SelectItem>
                <SelectItem value="voice">Voice Channel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No categories available</div>
                ) : (
                  categories.map((category: ChannelCategory) => (
                    <SelectItem key={category.id.toString()} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <Input
              id="channel-name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="general"
              maxLength={50}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button type="submit" disabled={isSubmitDisabled}>
                      {addTextChannel.isPending || addVoiceChannel.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Channel'
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {actionDisabled && actionDisabledReason && (
                  <TooltipContent>
                    <p>{actionDisabledReason}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
