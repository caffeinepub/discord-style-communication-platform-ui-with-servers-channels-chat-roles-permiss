import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Hash, Volume2 } from 'lucide-react';
import { useNavigation } from '../../../../state/navigation';
import { useGetCategories } from '../../../../hooks/useQueries';
import CreateChannelInSettingsDialog from '../components/CreateChannelInSettingsDialog';
import { Separator } from '@/components/ui/separator';

export default function ChannelsPage() {
  const { selectedServerId } = useNavigation();
  const { data: categories = [], isLoading } = useGetCategories(selectedServerId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<bigint | null>(null);

  const handleCreateChannel = (categoryId?: bigint) => {
    setSelectedCategoryId(categoryId || null);
    setShowCreateDialog(true);
  };

  if (!selectedServerId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No server selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Loading channels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Channels</h3>
          <p className="text-sm text-muted-foreground">
            Manage your server's text and voice channels
          </p>
        </div>
        <Button onClick={() => handleCreateChannel()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Channel
        </Button>
      </div>

      <Separator />

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No categories yet. Create a category first to add channels.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id.toString()} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                  {category.name}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateChannel(category.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Channel
                </Button>
              </div>

              <div className="space-y-3 pl-4">
                {/* Text Channels */}
                {category.textChannels.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Text Channels
                    </div>
                    <div className="space-y-1">
                      {category.textChannels.map((channel) => (
                        <div
                          key={channel.id.toString()}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{channel.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Channels */}
                {category.voiceChannels.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Voice Channels
                    </div>
                    <div className="space-y-1">
                      {category.voiceChannels.map((channel) => (
                        <div
                          key={channel.id.toString()}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{channel.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state for category */}
                {category.textChannels.length === 0 && category.voiceChannels.length === 0 && (
                  <div className="text-sm text-muted-foreground italic py-2">
                    No channels in this category yet
                  </div>
                )}
              </div>

              <Separator />
            </div>
          ))}
        </div>
      )}

      <CreateChannelInSettingsDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        serverId={selectedServerId}
        categories={categories}
        defaultCategoryId={selectedCategoryId}
      />
    </div>
  );
}
