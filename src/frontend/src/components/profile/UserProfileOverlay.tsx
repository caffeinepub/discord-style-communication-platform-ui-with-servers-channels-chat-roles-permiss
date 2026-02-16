import { useNavigation } from '@/state/navigation';
import { useGetUserProfile } from '@/hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function UserProfileOverlay() {
  const { selectedMemberId, setSelectedMemberId } = useNavigation();
  const isMobile = useIsMobile();

  const userId = selectedMemberId ? Principal.fromText(selectedMemberId) : null;
  const { data: profile, isLoading } = useGetUserProfile(userId);

  const isOpen = !!selectedMemberId;

  const handleClose = () => {
    setSelectedMemberId(null);
  };

  // Generate consistent avatar and banner
  const avatarIndex = selectedMemberId
    ? (parseInt(selectedMemberId.slice(-2), 16) % 6) + 1
    : 1;
  const defaultAvatar = `/assets/generated/avatar-default-0${avatarIndex}.dim_256x256.png`;
  const defaultBanner = '/assets/generated/profile-banner-default.dim_1200x400.png';

  const avatarUrl = profile?.avatarUrl || defaultAvatar;
  const bannerUrl = profile?.bannerUrl || defaultBanner;
  const displayName = profile?.name || 'User';
  const aboutMe = profile?.aboutMe || '';
  const customStatus = profile?.customStatus || '';
  const badges = profile?.badges || [];

  const content = (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="relative w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        <img
          src={bannerUrl}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Content */}
      <div className="px-4 pb-4">
        {/* Avatar overlapping banner */}
        <div className="relative -mt-12 mb-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-2xl">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        {/* Display Name */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">{displayName}</h2>
          {selectedMemberId && (
            <p className="text-xs text-muted-foreground font-mono break-all">
              {selectedMemberId.slice(0, 20)}...
            </p>
          )}
        </div>

        {/* Custom Status */}
        {customStatus && (
          <div className="mb-4 p-3 bg-accent/30 rounded-lg">
            <p className="text-sm">{customStatus}</p>
          </div>
        )}

        {/* About Me */}
        {aboutMe && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 uppercase text-muted-foreground">About Me</h3>
            <p className="text-sm whitespace-pre-wrap">{aboutMe}</p>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 uppercase text-muted-foreground">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading profile...</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>User Profile</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 bg-background/80 hover:bg-background"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="max-h-[80vh] overflow-y-auto">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
