import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Hash, Volume2, ChevronUp, ChevronDown, MoveHorizontal } from 'lucide-react';
import { useNavigation } from '../../../../state/navigation';
import { useGetCategories, useIsCallerAdmin, useGetCategoryChannelOrdering, useUpdateCategoryChannelOrdering, useMoveChannelToCategory } from '../../../../hooks/useQueries';
import CreateChannelInSettingsDialog from '../components/CreateChannelInSettingsDialog';
import MoveChannelDialog from '../components/MoveChannelDialog';
import { Separator } from '@/components/ui/separator';
import type { ChannelCategory, TextChannel, VoiceChannel } from '../../../../backend';
import { toast } from 'sonner';

export default function ChannelsPage() {
  const { selectedServerId } = useNavigation();
  const { data: categories = [], isLoading } = useGetCategories(selectedServerId);
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: ordering } = useGetCategoryChannelOrdering(selectedServerId);
  const updateOrderingMutation = useUpdateCategoryChannelOrdering();
  const moveChannelMutation = useMoveChannelToCategory();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<bigint | null>(null);
  
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveChannelData, setMoveChannelData] = useState<{
    channelId: bigint;
    channelName: string;
    isTextChannel: boolean;
    currentCategoryId: bigint;
  } | null>(null);

  const handleCreateChannel = (categoryId?: bigint) => {
    setSelectedCategoryId(categoryId || null);
    setShowCreateDialog(true);
  };

  const handleOpenMoveDialog = (
    channelId: bigint,
    channelName: string,
    isTextChannel: boolean,
    currentCategoryId: bigint
  ) => {
    if (!isAdmin) {
      toast.error("You don't have permission to move channels in this server");
      return;
    }
    setMoveChannelData({ channelId, channelName, isTextChannel, currentCategoryId });
    setShowMoveDialog(true);
  };

  const handleMoveChannel = (targetCategoryId: bigint) => {
    if (!selectedServerId || !moveChannelData) return;

    moveChannelMutation.mutate({
      serverId: selectedServerId,
      sourceCategoryId: moveChannelData.currentCategoryId,
      targetCategoryId,
      channelId: moveChannelData.channelId,
      isTextChannel: moveChannelData.isTextChannel,
      position: null,
    });
  };

  // Apply ordering to categories
  const orderedCategories = (() => {
    if (!ordering || !ordering.categoryOrder || ordering.categoryOrder.length === 0) {
      return categories;
    }
    
    const ordered: ChannelCategory[] = [];
    const categoryMap = new Map(categories.map(c => [c.id.toString(), c]));
    
    // Add categories in the specified order
    ordering.categoryOrder.forEach(catId => {
      const cat = categoryMap.get(catId.toString());
      if (cat) {
        ordered.push(cat);
        categoryMap.delete(catId.toString());
      }
    });
    
    // Add any remaining categories not in the ordering
    categoryMap.forEach(cat => ordered.push(cat));
    
    return ordered;
  })();

  // Apply ordering to channels within a category
  const getOrderedTextChannels = (category: ChannelCategory): TextChannel[] => {
    if (!ordering || !ordering.textChannelOrder) {
      return category.textChannels;
    }
    
    const orderArray = ordering.textChannelOrder.find(([catId]) => catId === category.id)?.[1];
    if (!orderArray || orderArray.length === 0) {
      return category.textChannels;
    }
    
    const ordered: TextChannel[] = [];
    const channelMap = new Map(category.textChannels.map(ch => [ch.id.toString(), ch]));
    
    orderArray.forEach(chId => {
      const ch = channelMap.get(chId.toString());
      if (ch) {
        ordered.push(ch);
        channelMap.delete(chId.toString());
      }
    });
    
    channelMap.forEach(ch => ordered.push(ch));
    return ordered;
  };

  const getOrderedVoiceChannels = (category: ChannelCategory): VoiceChannel[] => {
    if (!ordering || !ordering.voiceChannelOrder) {
      return category.voiceChannels;
    }
    
    const orderArray = ordering.voiceChannelOrder.find(([catId]) => catId === category.id)?.[1];
    if (!orderArray || orderArray.length === 0) {
      return category.voiceChannels;
    }
    
    const ordered: VoiceChannel[] = [];
    const channelMap = new Map(category.voiceChannels.map(ch => [ch.id.toString(), ch]));
    
    orderArray.forEach(chId => {
      const ch = channelMap.get(chId.toString());
      if (ch) {
        ordered.push(ch);
        channelMap.delete(chId.toString());
      }
    });
    
    channelMap.forEach(ch => ordered.push(ch));
    return ordered;
  };

  // Move category up/down
  const moveCategoryUp = (index: number) => {
    if (!isAdmin) {
      toast.error("You don't have permission to reorder channels in this server");
      return;
    }
    if (index === 0) return;
    
    const newOrder = [...orderedCategories.map(c => c.id)];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    
    saveOrdering(newOrder, ordering?.textChannelOrder || [], ordering?.voiceChannelOrder || []);
  };

  const moveCategoryDown = (index: number) => {
    if (!isAdmin) {
      toast.error("You don't have permission to reorder channels in this server");
      return;
    }
    if (index === orderedCategories.length - 1) return;
    
    const newOrder = [...orderedCategories.map(c => c.id)];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    
    saveOrdering(newOrder, ordering?.textChannelOrder || [], ordering?.voiceChannelOrder || []);
  };

  // Move text channel up/down
  const moveTextChannelUp = (category: ChannelCategory, channelIndex: number) => {
    if (!isAdmin) {
      toast.error("You don't have permission to reorder channels in this server");
      return;
    }
    if (channelIndex === 0) return;
    
    const orderedChannels = getOrderedTextChannels(category);
    const newOrder = [...orderedChannels.map(ch => ch.id)];
    [newOrder[channelIndex - 1], newOrder[channelIndex]] = [newOrder[channelIndex], newOrder[channelIndex - 1]];
    
    const newTextChannelOrder = [...(ordering?.textChannelOrder || [])];
    const existingIndex = newTextChannelOrder.findIndex(([catId]) => catId === category.id);
    
    if (existingIndex >= 0) {
      newTextChannelOrder[existingIndex] = [category.id, newOrder];
    } else {
      newTextChannelOrder.push([category.id, newOrder]);
    }
    
    saveOrdering(
      ordering?.categoryOrder || orderedCategories.map(c => c.id),
      newTextChannelOrder,
      ordering?.voiceChannelOrder || []
    );
  };

  const moveTextChannelDown = (category: ChannelCategory, channelIndex: number) => {
    if (!isAdmin) {
      toast.error("You don't have permission to reorder channels in this server");
      return;
    }
    const orderedChannels = getOrderedTextChannels(category);
    if (channelIndex === orderedChannels.length - 1) return;
    
    const newOrder = [...orderedChannels.map(ch => ch.id)];
    [newOrder[channelIndex], newOrder[channelIndex + 1]] = [newOrder[channelIndex + 1], newOrder[channelIndex]];
    
    const newTextChannelOrder = [...(ordering?.textChannelOrder || [])];
    const existingIndex = newTextChannelOrder.findIndex(([catId]) => catId === category.id);
    
    if (existingIndex >= 0) {
      newTextChannelOrder[existingIndex] = [category.id, newOrder];
    } else {
      newTextChannelOrder.push([category.id, newOrder]);
    }
    
    saveOrdering(
      ordering?.categoryOrder || orderedCategories.map(c => c.id),
      newTextChannelOrder,
      ordering?.voiceChannelOrder || []
    );
  };

  // Move voice channel up/down
  const moveVoiceChannelUp = (category: ChannelCategory, channelIndex: number) => {
    if (!isAdmin) {
      toast.error("You don't have permission to reorder channels in this server");
      return;
    }
    if (channelIndex === 0) return;
    
    const orderedChannels = getOrderedVoiceChannels(category);
    const newOrder = [...orderedChannels.map(ch => ch.id)];
    [newOrder[channelIndex - 1], newOrder[channelIndex]] = [newOrder[channelIndex], newOrder[channelIndex - 1]];
    
    const newVoiceChannelOrder = [...(ordering?.voiceChannelOrder || [])];
    const existingIndex = newVoiceChannelOrder.findIndex(([catId]) => catId === category.id);
    
    if (existingIndex >= 0) {
      newVoiceChannelOrder[existingIndex] = [category.id, newOrder];
    } else {
      newVoiceChannelOrder.push([category.id, newOrder]);
    }
    
    saveOrdering(
      ordering?.categoryOrder || orderedCategories.map(c => c.id),
      ordering?.textChannelOrder || [],
      newVoiceChannelOrder
    );
  };

  const moveVoiceChannelDown = (category: ChannelCategory, channelIndex: number) => {
    if (!isAdmin) {
      toast.error("You don't have permission to reorder channels in this server");
      return;
    }
    const orderedChannels = getOrderedVoiceChannels(category);
    if (channelIndex === orderedChannels.length - 1) return;
    
    const newOrder = [...orderedChannels.map(ch => ch.id)];
    [newOrder[channelIndex], newOrder[channelIndex + 1]] = [newOrder[channelIndex + 1], newOrder[channelIndex]];
    
    const newVoiceChannelOrder = [...(ordering?.voiceChannelOrder || [])];
    const existingIndex = newVoiceChannelOrder.findIndex(([catId]) => catId === category.id);
    
    if (existingIndex >= 0) {
      newVoiceChannelOrder[existingIndex] = [category.id, newOrder];
    } else {
      newVoiceChannelOrder.push([category.id, newOrder]);
    }
    
    saveOrdering(
      ordering?.categoryOrder || orderedCategories.map(c => c.id),
      ordering?.textChannelOrder || [],
      newVoiceChannelOrder
    );
  };

  const saveOrdering = (
    categoryOrder: bigint[],
    textChannelOrder: [bigint, bigint[]][],
    voiceChannelOrder: [bigint, bigint[]][]
  ) => {
    if (!selectedServerId) return;
    
    updateOrderingMutation.mutate({
      serverId: selectedServerId,
      categoryOrder,
      textChannelOrderEntries: textChannelOrder,
      voiceChannelOrderEntries: voiceChannelOrder,
    });
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
            {isAdmin && ' • Reorder with arrow buttons or move between categories'}
          </p>
        </div>
        <Button onClick={() => handleCreateChannel()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Channel
        </Button>
      </div>

      <Separator />

      {orderedCategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No categories yet. Create a category first to add channels.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderedCategories.map((category, categoryIndex) => {
            const orderedTextChannels = getOrderedTextChannels(category);
            const orderedVoiceChannels = getOrderedVoiceChannels(category);
            
            return (
              <div key={category.id.toString()} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                      {category.name}
                    </h4>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveCategoryUp(categoryIndex)}
                          disabled={categoryIndex === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveCategoryDown(categoryIndex)}
                          disabled={categoryIndex === orderedCategories.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
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
                  {orderedTextChannels.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Text Channels
                      </div>
                      <div className="space-y-1">
                        {orderedTextChannels.map((channel, channelIndex) => (
                          <div
                            key={channel.id.toString()}
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm flex-1">{channel.name}</span>
                            {isAdmin && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveTextChannelUp(category, channelIndex)}
                                  disabled={channelIndex === 0}
                                  title="Move up"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveTextChannelDown(category, channelIndex)}
                                  disabled={channelIndex === orderedTextChannels.length - 1}
                                  title="Move down"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    handleOpenMoveDialog(channel.id, channel.name, true, category.id)
                                  }
                                  title="Move to another category"
                                >
                                  <MoveHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voice Channels */}
                  {orderedVoiceChannels.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Voice Channels
                      </div>
                      <div className="space-y-1">
                        {orderedVoiceChannels.map((channel, channelIndex) => (
                          <div
                            key={channel.id.toString()}
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm flex-1">{channel.name}</span>
                            {isAdmin && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveVoiceChannelUp(category, channelIndex)}
                                  disabled={channelIndex === 0}
                                  title="Move up"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveVoiceChannelDown(category, channelIndex)}
                                  disabled={channelIndex === orderedVoiceChannels.length - 1}
                                  title="Move down"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    handleOpenMoveDialog(channel.id, channel.name, false, category.id)
                                  }
                                  title="Move to another category"
                                >
                                  <MoveHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for category */}
                  {orderedTextChannels.length === 0 && orderedVoiceChannels.length === 0 && (
                    <div className="text-sm text-muted-foreground italic py-2">
                      No channels in this category yet
                    </div>
                  )}
                </div>

                <Separator />
              </div>
            );
          })}
        </div>
      )}

      <CreateChannelInSettingsDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        serverId={selectedServerId}
        categories={categories}
        defaultCategoryId={selectedCategoryId}
      />

      {moveChannelData && (
        <MoveChannelDialog
          open={showMoveDialog}
          onOpenChange={setShowMoveDialog}
          channelId={moveChannelData.channelId}
          channelName={moveChannelData.channelName}
          isTextChannel={moveChannelData.isTextChannel}
          currentCategoryId={moveChannelData.currentCategoryId}
          categories={categories}
          onMove={handleMoveChannel}
          isPending={moveChannelMutation.isPending}
        />
      )}
    </div>
  );
}
