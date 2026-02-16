import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Hash, Volume2, Plus } from 'lucide-react';
import type { ChannelCategory, TextChannel, VoiceChannel, ServerOrdering } from '../../../../types/local';
import { useNavigation } from '../../../../state/navigation';
import { useGetCategories, useIsCallerAdmin, useGetCategoryChannelOrdering, useUpdateCategoryChannelOrdering } from '../../../../hooks/useQueries';
import CreateChannelInSettingsDialog from '../components/CreateChannelInSettingsDialog';
import { applyOrderingToCategories, applyOrderingToTextChannels, applyOrderingToVoiceChannels, buildCategoryLevelOrdering } from '../../../../utils/channelOrdering';

interface ChannelsPageProps {
  serverId: bigint;
}

export default function ChannelsPage({ serverId }: ChannelsPageProps) {
  const { data: categories = [], isLoading } = useGetCategories(serverId);
  const { data: isAdmin } = useIsCallerAdmin();
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const { data: persistedOrdering } = useGetCategoryChannelOrdering(serverId);
  const updateOrdering = useUpdateCategoryChannelOrdering();

  // Apply persisted ordering to categories
  const orderedCategories = applyOrderingToCategories(categories, persistedOrdering ?? null);

  const moveTextChannelUp = (categoryId: bigint, channelId: bigint) => {
    const category = orderedCategories.find(c => c.id === categoryId);
    if (!category) return;

    const orderedTextChannels = applyOrderingToTextChannels(category, persistedOrdering ?? null);
    const currentIndex = orderedTextChannels.findIndex(ch => ch.id === channelId);
    if (currentIndex <= 0) return;

    const newOrder = orderedTextChannels.map(ch => ch.id);
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];

    // Build the full ordering structure
    const categoryLevelOrdering = buildCategoryLevelOrdering(orderedCategories);
    const updatedCategoryOrdering = categoryLevelOrdering.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, textChannels: newOrder };
      }
      return cat;
    });

    const newServerOrdering: ServerOrdering = {
      categoryOrder: persistedOrdering?.categoryOrder ?? orderedCategories.map(c => c.id),
      categories: updatedCategoryOrdering,
    };

    updateOrdering.mutate({
      serverId,
      ordering: newServerOrdering,
    });
  };

  const moveTextChannelDown = (categoryId: bigint, channelId: bigint) => {
    const category = orderedCategories.find(c => c.id === categoryId);
    if (!category) return;

    const orderedTextChannels = applyOrderingToTextChannels(category, persistedOrdering ?? null);
    const currentIndex = orderedTextChannels.findIndex(ch => ch.id === channelId);
    if (currentIndex === -1 || currentIndex >= orderedTextChannels.length - 1) return;

    const newOrder = orderedTextChannels.map(ch => ch.id);
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];

    // Build the full ordering structure
    const categoryLevelOrdering = buildCategoryLevelOrdering(orderedCategories);
    const updatedCategoryOrdering = categoryLevelOrdering.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, textChannels: newOrder };
      }
      return cat;
    });

    const newServerOrdering: ServerOrdering = {
      categoryOrder: persistedOrdering?.categoryOrder ?? orderedCategories.map(c => c.id),
      categories: updatedCategoryOrdering,
    };

    updateOrdering.mutate({
      serverId,
      ordering: newServerOrdering,
    });
  };

  const moveVoiceChannelUp = (categoryId: bigint, channelId: bigint) => {
    const category = orderedCategories.find(c => c.id === categoryId);
    if (!category) return;

    const orderedVoiceChannels = applyOrderingToVoiceChannels(category, persistedOrdering ?? null);
    const currentIndex = orderedVoiceChannels.findIndex(ch => ch.id === channelId);
    if (currentIndex <= 0) return;

    const newOrder = orderedVoiceChannels.map(ch => ch.id);
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];

    // Build the full ordering structure
    const categoryLevelOrdering = buildCategoryLevelOrdering(orderedCategories);
    const updatedCategoryOrdering = categoryLevelOrdering.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, voiceChannels: newOrder };
      }
      return cat;
    });

    const newServerOrdering: ServerOrdering = {
      categoryOrder: persistedOrdering?.categoryOrder ?? orderedCategories.map(c => c.id),
      categories: updatedCategoryOrdering,
    };

    updateOrdering.mutate({
      serverId,
      ordering: newServerOrdering,
    });
  };

  const moveVoiceChannelDown = (categoryId: bigint, channelId: bigint) => {
    const category = orderedCategories.find(c => c.id === categoryId);
    if (!category) return;

    const orderedVoiceChannels = applyOrderingToVoiceChannels(category, persistedOrdering ?? null);
    const currentIndex = orderedVoiceChannels.findIndex(ch => ch.id === channelId);
    if (currentIndex === -1 || currentIndex >= orderedVoiceChannels.length - 1) return;

    const newOrder = orderedVoiceChannels.map(ch => ch.id);
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];

    // Build the full ordering structure
    const categoryLevelOrdering = buildCategoryLevelOrdering(orderedCategories);
    const updatedCategoryOrdering = categoryLevelOrdering.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, voiceChannels: newOrder };
      }
      return cat;
    });

    const newServerOrdering: ServerOrdering = {
      categoryOrder: persistedOrdering?.categoryOrder ?? orderedCategories.map(c => c.id),
      categories: updatedCategoryOrdering,
    };

    updateOrdering.mutate({
      serverId,
      ordering: newServerOrdering,
    });
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading channels...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Channels</h3>
          <p className="text-sm text-muted-foreground">
            Manage your server's channels and categories
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateChannelOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Channel
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {orderedCategories.map((category: ChannelCategory) => {
          const orderedTextChannels = applyOrderingToTextChannels(category, persistedOrdering ?? null);
          const orderedVoiceChannels = applyOrderingToVoiceChannels(category, persistedOrdering ?? null);

          return (
            <div key={category.id.toString()} className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                {category.name}
              </h4>

              {orderedTextChannels.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Text Channels</p>
                  {orderedTextChannels.map((channel: TextChannel, index: number) => (
                    <div
                      key={channel.id.toString()}
                      className="flex items-center justify-between p-2 rounded hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{channel.name}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveTextChannelUp(category.id, channel.id)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveTextChannelDown(category.id, channel.id)}
                            disabled={index === orderedTextChannels.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {orderedVoiceChannels.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Voice Channels</p>
                  {orderedVoiceChannels.map((channel: VoiceChannel, index: number) => (
                    <div
                      key={channel.id.toString()}
                      className="flex items-center justify-between p-2 rounded hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{channel.name}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveVoiceChannelUp(category.id, channel.id)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveVoiceChannelDown(category.id, channel.id)}
                            disabled={index === orderedVoiceChannels.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CreateChannelInSettingsDialog
        open={createChannelOpen}
        onOpenChange={setCreateChannelOpen}
        serverId={serverId}
      />
    </div>
  );
}
