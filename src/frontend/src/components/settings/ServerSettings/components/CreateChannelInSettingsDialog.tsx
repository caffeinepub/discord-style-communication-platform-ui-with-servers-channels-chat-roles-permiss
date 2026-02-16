import { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Hash, Volume2 } from 'lucide-react';
import { useAddTextChannel, useAddVoiceChannel } from '../../../../hooks/useQueries';
import type { ChannelCategory } from '../../../../backend';

interface CreateChannelInSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: bigint;
  categories: ChannelCategory[];
  defaultCategoryId?: bigint | null;
}

type ChannelType = 'text' | 'voice';

export default function CreateChannelInSettingsDialog({
  open,
  onOpenChange,
  serverId,
  categories,
  defaultCategoryId,
}: CreateChannelInSettingsDialogProps) {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>('text');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const addTextChannel = useAddTextChannel();
  const addVoiceChannel = useAddVoiceChannel();

  const isPending = addTextChannel.isPending || addVoiceChannel.isPending;

  // Set default category when dialog opens or defaultCategoryId changes
  useEffect(() => {
    if (open && defaultCategoryId) {
      setSelectedCategoryId(defaultCategoryId.toString());
    } else if (open && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id.toString());
    }
  }, [open, defaultCategoryId, categories, selectedCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !selectedCategoryId) return;

    try {
      const categoryId = BigInt(selectedCategoryId);
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
      setChannelType('text');
      setSelectedCategoryId('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setChannelName('');
      setChannelType('text');
      setSelectedCategoryId('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>
              Add a new text or voice channel to your server.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Channel Type</Label>
              <RadioGroup
                value={channelType}
                onValueChange={(value) => setChannelType(value as ChannelType)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="text"
                    id="text"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="text"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Hash className="mb-2 h-6 w-6" />
                    <span className="text-sm font-medium">Text</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="voice"
                    id="voice"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="voice"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Volume2 className="mb-2 h-6 w-6" />
                    <span className="text-sm font-medium">Voice</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                disabled={categories.length === 0}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id.toString()} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Create a category first before adding channels
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder={channelType === 'text' ? 'e.g., general-chat' : 'e.g., voice-lounge'}
                maxLength={50}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!channelName.trim() || !selectedCategoryId || isPending || categories.length === 0}
            >
              {isPending ? 'Creating...' : 'Create Channel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
