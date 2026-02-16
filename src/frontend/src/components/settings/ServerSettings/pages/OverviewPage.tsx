import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useNavigation } from '../../../../state/navigation';
import { useGetServer, useUpdateServerSettings } from '../../../../hooks/useQueries';
import { Loader2 } from 'lucide-react';

export default function OverviewPage() {
  const { selectedServerId } = useNavigation();
  const { data: server } = useGetServer(selectedServerId);
  const updateSettings = useUpdateServerSettings();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [communityMode, setCommunityMode] = useState(false);

  useEffect(() => {
    if (server) {
      setName(server.name);
      setDescription(server.description);
      setBannerUrl(server.bannerUrl);
      setIconUrl(server.iconUrl);
      setCommunityMode(server.communityMode);
    }
  }, [server]);

  const handleSave = async () => {
    if (!selectedServerId) return;

    await updateSettings.mutateAsync({
      serverId: selectedServerId,
      description,
      bannerUrl,
      iconUrl,
      communityMode,
    });
  };

  if (!server) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="server-name">Server Name</Label>
        <Input
          id="server-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled
        />
        <p className="text-xs text-muted-foreground">Server name cannot be changed here</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon-url">Icon URL</Label>
        <Input
          id="icon-url"
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value)}
          placeholder="https://example.com/icon.png"
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

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Community Mode</Label>
          <p className="text-sm text-muted-foreground">
            Enable community features for your server
          </p>
        </div>
        <Switch checked={communityMode} onCheckedChange={setCommunityMode} />
      </div>

      <Button onClick={handleSave} disabled={updateSettings.isPending}>
        {updateSettings.isPending ? (
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
