import React, { useState } from 'react';
import { Hash, Volume2, ChevronUp, ChevronDown } from 'lucide-react';
import { useGetCategories, useSetCategoryOrder, useSetChannelOrder, useIsCallerAdmin } from '../../../../hooks/useQueries';
import type { ChannelCategory, TextChannel, VoiceChannel } from '../../../../types/backend-extended';
import CreateChannelInSettingsDialog from '../components/CreateChannelInSettingsDialog';
import { Button } from '../../../ui/button';
import { categoryToChannelCategory } from '../../../../types/backend-extended';

interface ChannelsPageProps {
  serverId: string;
}

export function ChannelsPage({ serverId }: ChannelsPageProps) {
  const { data: categories = [] } = useGetCategories(serverId);
  const { data: isAdmin } = useIsCallerAdmin();
  const setCategoryOrder = useSetCategoryOrder();
  const setChannelOrder = useSetChannelOrder();

  const [createChannelOpen, setCreateChannelOpen] = useState(false);

  // Convert backend categories to channel categories
  const channelCategories: ChannelCategory[] = categories.map(categoryToChannelCategory);

  const handleMoveUp = (categoryId: string, channelId: string, isTextChannel: boolean) => {
    if (!isAdmin) return;

    const category = channelCategories.find(c => c.id === categoryId);
    if (!category) return;

    const channels = isTextChannel ? category.textChannels : category.voiceChannels;
    const currentOrder = channels.map(ch => ch.id);
    const index = currentOrder.findIndex(id => id === channelId);

    if (index <= 0) return;

    const newOrder = [...currentOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    setChannelOrder.mutate({
      serverId,
      categoryId,
      newOrder,
    });
  };

  const handleMoveDown = (categoryId: string, channelId: string, isTextChannel: boolean) => {
    if (!isAdmin) return;

    const category = channelCategories.find(c => c.id === categoryId);
    if (!category) return;

    const channels = isTextChannel ? category.textChannels : category.voiceChannels;
    const currentOrder = channels.map(ch => ch.id);
    const index = currentOrder.findIndex(id => id === channelId);

    if (index === -1 || index >= currentOrder.length - 1) return;

    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    setChannelOrder.mutate({
      serverId,
      categoryId,
      newOrder,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Channels</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your server's text and voice channels
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateChannelOpen(true)}>Create Channel</Button>
        )}
      </div>

      <div className="space-y-4">
        {channelCategories.map((category: ChannelCategory) => {
          return (
            <div key={category.id} className="border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
                {category.name}
              </h3>

              {category.textChannels.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Text Channels</h4>
                  {category.textChannels.map((channel: TextChannel, index: number) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-2 rounded bg-accent/30"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span className="text-sm">{channel.name}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveUp(category.id, channel.id, true)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDown(category.id, channel.id, true)}
                            disabled={index === category.textChannels.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {category.voiceChannels.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Voice Channels</h4>
                  {category.voiceChannels.map((channel: VoiceChannel, index: number) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-2 rounded bg-accent/30"
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <span className="text-sm">{channel.name}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveUp(category.id, channel.id, false)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDown(category.id, channel.id, false)}
                            disabled={index === category.voiceChannels.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {category.textChannels.length === 0 && category.voiceChannels.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No channels in this category
                </p>
              )}
            </div>
          );
        })}

        {channelCategories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No categories yet</p>
            <p className="text-sm mt-2">Create a category to organize your channels</p>
          </div>
        )}
      </div>

      <CreateChannelInSettingsDialog
        open={createChannelOpen}
        onOpenChange={setCreateChannelOpen}
        serverId={serverId}
      />
    </div>
  );
}
