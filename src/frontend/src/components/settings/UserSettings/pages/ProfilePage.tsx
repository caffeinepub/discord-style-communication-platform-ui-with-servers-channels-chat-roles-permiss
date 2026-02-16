import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetCallerUsername, useSetUsername } from '../../../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import AdminReplicaResetSection from '../components/AdminReplicaResetSection';

export default function ProfilePage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: currentUsername, isLoading: usernameLoading } = useGetCallerUsername();
  const saveProfileMutation = useSaveCallerUserProfile();
  const setUsernameMutation = useSetUsername();

  // Profile form state
  const [name, setName] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [customStatus, setCustomStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Username form state
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setAboutMe(userProfile.aboutMe || '');
      setCustomStatus(userProfile.customStatus || '');
      setAvatarUrl(userProfile.avatarUrl || '');
      setBannerUrl(userProfile.bannerUrl || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (currentUsername) {
      setUsername(currentUsername);
    }
  }, [currentUsername]);

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    await saveProfileMutation.mutateAsync({
      ...userProfile,
      name,
      aboutMe,
      customStatus,
      avatarUrl,
      bannerUrl,
    });
  };

  const handleSaveUsername = async () => {
    if (!username) return;
    await setUsernameMutation.mutateAsync(username);
  };

  const isProfileChanged = userProfile && (
    name !== (userProfile.name || '') ||
    aboutMe !== (userProfile.aboutMe || '') ||
    customStatus !== (userProfile.customStatus || '') ||
    avatarUrl !== (userProfile.avatarUrl || '') ||
    bannerUrl !== (userProfile.bannerUrl || '')
  );

  const isUsernameChanged = currentUsername && username !== currentUsername;

  if (profileLoading || usernameLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Account Information Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Account Information</h3>
          <p className="text-sm text-muted-foreground">
            Your account details and contact information
          </p>
        </div>

        <div className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-7"
                  placeholder="username"
                />
              </div>
              <Button
                onClick={handleSaveUsername}
                disabled={!isUsernameChanged || setUsernameMutation.isPending}
              >
                {setUsernameMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This is your unique username visible to others
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Profile Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Customize how you appear to others
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-status">Custom Status</Label>
            <Input
              id="custom-status"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={128}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about-me">About Me</Label>
            <Textarea
              id="about-me"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {aboutMe.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-url">Avatar URL</Label>
            <Input
              id="avatar-url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-url">Banner URL</Label>
            <Input
              id="banner-url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={!isProfileChanged || saveProfileMutation.isPending}
            className="w-full sm:w-auto"
          >
            {saveProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Admin Replica Reset Section - only visible to admins */}
      <AdminReplicaResetSection />
    </div>
  );
}
