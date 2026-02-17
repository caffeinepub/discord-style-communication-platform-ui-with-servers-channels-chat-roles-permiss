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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hash, Volume2, AlertCircle } from 'lucide-react';
import { useGetCategories, useAddTextChannelToCategory, useAddVoiceChannelToCategory } from '../../../../hooks/useQueries';
import { useBackendActionGuard } from '@/hooks/useBackendActionGuard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateChannelInSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
}

type ChannelType = 'text' | 'voice';

export default function CreateChannelInSettingsDialog({
  open,
  onOpenChange,
  serverId,
}: CreateChannelInSettingsDialogProps) {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>('text');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const { data: categories = [] } = useGetCategories(serverId);
  const addTextChannel = useAddTextChannelToCategory();
  const addVoiceChannel = useAddVoiceChannelToCategory();
  const { disabled: backendDisabled, reason: backendReason } = useBackendActionGuard();

  const isPending = addTextChannel.isPending || addVoiceChannel.isPending;
  const currentMutation = channelType === 'text' ? addTextChannel : addVoiceChannel;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !selectedCategoryId || backendDisabled) return;

    try {
      if (channelType === 'text') {
        await addTextChannel.mutateAsync({
          serverId,
          categoryId: selectedCategoryId,
          name: channelName.trim(),
        });
      } else {
        await addVoiceChannel.mutateAsync({
          serverId,
          categoryId: selectedCategoryId,
          name: channelName.trim(),
        });
      }
      // Only close and reset on success
      setChannelName('');
      setChannelType('text');
      setSelectedCategoryId('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError (toast)
      // Dialog stays open so user can see the error and retry
      console.error('Failed to create channel:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      setChannelName('');
      setChannelType('text');
      setSelectedCategoryId('');
      addTextChannel.reset();
      addVoiceChannel.reset();
    }
    onOpenChange(newOpen);
  };

  const isSubmitDisabled = !channelName.trim() || !selectedCategoryId || isPending || backendDisabled;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>
              Add a new text or voice channel to a category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {currentMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {currentMutation.error?.message || 'Failed to create channel'}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Channel Type</Label>
              <RadioGroup
                value={channelType}
                onValueChange={(value) => setChannelType(value as ChannelType)}
                className="grid grid-cols-2 gap-4"
                disabled={backendDisabled || isPending}
              >
                <div>
                  <RadioGroupItem
                    value="text"
                    id="text"
                    className="peer sr-only"
                    disabled={backendDisabled || isPending}
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
                    disabled={backendDisabled || isPending}
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
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder={channelType === 'text' ? 'e.g., general-chat' : 'e.g., voice-lounge'}
                maxLength={50}
                autoFocus
                disabled={backendDisabled || isPending}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button type="submit" disabled={isSubmitDisabled}>
                    {isPending ? 'Creating...' : 'Create Channel'}
                  </Button>
                </span>
              </TooltipTrigger>
              {backendDisabled && backendReason && (
                <TooltipContent>
                  <p>{backendReason}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
