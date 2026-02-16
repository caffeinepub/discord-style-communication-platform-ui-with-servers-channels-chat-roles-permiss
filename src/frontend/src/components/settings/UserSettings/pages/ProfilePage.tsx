import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetCallerUsername, useSetUsername } from '../../../../hooks/useQueries';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: currentUsername } = useGetCallerUsername();
  const saveProfile = useSaveCallerUserProfile();
  const setUsername = useSetUsername();

  const [name, setName] = useState('');
  const [username, setUsernameLocal] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [customStatus, setCustomStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAboutMe(profile.aboutMe);
      setCustomStatus(profile.customStatus);
      setAvatarUrl(profile.avatarUrl);
      setBannerUrl(profile.bannerUrl);
    }
  }, [profile]);

  useEffect(() => {
    if (currentUsername) {
      setUsernameLocal(currentUsername);
    }
  }, [currentUsername]);

  const handleSaveProfile = async () => {
    await saveProfile.mutateAsync({
      name,
      aboutMe,
      customStatus,
      avatarUrl,
      bannerUrl,
      badges: profile?.badges || [],
    });
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      return;
    }
    await setUsername.mutateAsync(username.trim());
  };

  const usernameChanged = username !== (currentUsername || '');

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsernameLocal(e.target.value)}
              className="pl-7"
              placeholder="username"
            />
          </div>
          {usernameChanged && (
            <Button onClick={handleSaveUsername} disabled={setUsername.isPending || !username.trim()}>
              {setUsername.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Your unique username. Must be globally unique.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-status">Custom Status</Label>
        <Input
          id="custom-status"
          value={customStatus}
          onChange={(e) => setCustomStatus(e.target.value)}
          placeholder="What's on your mind?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="about-me">About Me</Label>
        <Textarea
          id="about-me"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          rows={4}
          placeholder="Tell us about yourself"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar-url">Avatar URL</Label>
        <Input
          id="avatar-url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner-url">Banner URL</Label>
        <Input
          id="banner-url"
          value={bannerUrl}
          onChange={(e) => setBannerUrl(e.target.value)}
          placeholder="https://example.com/banner.png"
        />
      </div>

      <Button onClick={handleSaveProfile} disabled={saveProfile.isPending}>
        {saveProfile.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}
