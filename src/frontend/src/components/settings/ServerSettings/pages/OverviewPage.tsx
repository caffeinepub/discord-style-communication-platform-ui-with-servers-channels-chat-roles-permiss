import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useNavigation } from '../../../../state/navigation';
import { useGetServer, useRenameServer, useUpdateServerSettings } from '../../../../hooks/useQueries';
import { toast } from 'sonner';

export function OverviewPage() {
  const { selectedServerId } = useNavigation();
  const { data: server, isLoading } = useGetServer(selectedServerId);
  const renameServer = useRenameServer();
  const updateSettings = useUpdateServerSettings();

  const [serverName, setServerName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [communityMode, setCommunityMode] = useState(false);

  useEffect(() => {
    if (server) {
      setServerName(server.name);
      setDescription(server.description);
      setBannerUrl(server.bannerURL || '');
      setIconUrl(server.iconURL || '');
      setCommunityMode(server.isPublic || false);
    }
  }, [server]);

  const handleSaveName = async () => {
    if (!selectedServerId || !serverName.trim()) return;
    try {
      await renameServer.mutateAsync({ serverId: selectedServerId, newName: serverName.trim() });
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedServerId) return;
    try {
      await updateSettings.mutateAsync({
        serverId: selectedServerId,
        description,
        bannerUrl,
        iconUrl,
        communityMode,
      });
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading server settings...</div>;
  }

  if (!server) {
    return <div className="text-muted-foreground">Server not found</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-4">Server Overview</h2>
        <p className="text-sm text-muted-foreground">
          Manage your server's basic settings and information
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="server-name">Server Name</Label>
          <div className="flex gap-2">
            <Input
              id="server-name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="Enter server name"
            />
            <Button onClick={handleSaveName} disabled={renameServer.isPending || !serverName.trim()}>
              {renameServer.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your server"
            rows={4}
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

        <div className="space-y-2">
          <Label htmlFor="icon-url">Icon URL</Label>
          <Input
            id="icon-url"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            placeholder="https://example.com/icon.png"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="community-mode">Community Mode</Label>
            <p className="text-sm text-muted-foreground">
              Make your server discoverable in the server discovery page
            </p>
          </div>
          <Switch
            id="community-mode"
            checked={communityMode}
            onCheckedChange={setCommunityMode}
          />
        </div>

        <Button onClick={handleSaveSettings} disabled={updateSettings.isPending} className="w-full">
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
