import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetCallerUsername } from '../../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface ProfileSetupDialogProps {
  open: boolean;
  onComplete: () => void;
}

export default function ProfileSetupDialog({ open, onComplete }: ProfileSetupDialogProps) {
  const { data: existingProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: currentUsername, isLoading: usernameLoading } = useGetCallerUsername();
  const saveProfile = useSaveCallerUserProfile();
  
  const [name, setName] = useState('');
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Prefill the display name from existing profile or username
  useEffect(() => {
    if (!hasUserEdited && open) {
      // Priority: existing profile name > username > empty
      if (existingProfile?.name) {
        setName(existingProfile.name);
      } else if (currentUsername) {
        setName(currentUsername);
      }
    }
  }, [existingProfile, currentUsername, hasUserEdited, open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setHasUserEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Merge with existing profile to preserve other fields
    const profileToSave = {
      name: name.trim(),
      aboutMe: existingProfile?.aboutMe || '',
      customStatus: existingProfile?.customStatus || '',
      avatarUrl: existingProfile?.avatarUrl || '',
      bannerUrl: existingProfile?.bannerUrl || '',
      badges: existingProfile?.badges || [],
    };

    await saveProfile.mutateAsync(profileToSave);
    onComplete();
  };

  const isLoading = profileLoading || usernameLoading;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Let's set up your profile</DialogTitle>
          <DialogDescription>
            {isLoading ? 'Loading your information...' : 'Confirm or update your display name'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              autoFocus
              required
              disabled={isLoading}
            />
            {!isLoading && name && !hasUserEdited && (
              <p className="text-xs text-muted-foreground">
                We've prefilled this with your username. You can change it if you'd like.
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!name.trim() || saveProfile.isPending || isLoading}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
