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
import { Textarea } from '@/components/ui/textarea';
import { useCreateServer } from '../../hooks/useQueries';
import { useBackendActionGuard } from '@/hooks/useBackendActionGuard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateServerDialog({ open, onOpenChange }: CreateServerDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createServer = useCreateServer();
  const { disabled: backendDisabled, reason: backendReason } = useBackendActionGuard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || backendDisabled) return;

    try {
      await createServer.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });
      setName('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName('');
      setDescription('');
    }
    onOpenChange(newOpen);
  };

  const isSubmitDisabled = !name.trim() || createServer.isPending || backendDisabled;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Server</DialogTitle>
            <DialogDescription>
              Create a new server to chat with friends and communities.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="server-name">Server Name</Label>
              <Input
                id="server-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Server"
                maxLength={50}
                autoFocus
                disabled={backendDisabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="server-description">Description (Optional)</Label>
              <Textarea
                id="server-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A place for awesome people"
                maxLength={200}
                rows={3}
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
              disabled={createServer.isPending}
            >
              Cancel
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button type="submit" disabled={isSubmitDisabled}>
                    {createServer.isPending ? 'Creating...' : 'Create Server'}
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
