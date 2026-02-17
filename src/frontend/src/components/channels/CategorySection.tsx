import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Hash, Volume2, Plus } from 'lucide-react';
import { useNavigation } from '../../state/navigation';
import type { ChannelCategory, TextChannel, VoiceChannel, ServerOrdering } from '../../types/backend-extended';
import CreateChannelDialog from './CreateChannelDialog';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useSetChannelOrder } from '../../hooks/useQueries';
import { applyOrderingToTextChannels, applyOrderingToVoiceChannels } from '../../utils/channelOrdering';

interface CategorySectionProps {
  serverId: string;
  category: ChannelCategory;
  allCategories: ChannelCategory[];
  onToggleExpanded: (categoryId: string) => void;
  persistedOrdering: ServerOrdering | null;
}

export function CategorySection({ serverId, category, allCategories, onToggleExpanded, persistedOrdering }: CategorySectionProps) {
  const { selectedChannelId, selectedChannelType, selectChannel } = useNavigation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: isAdmin } = useIsCallerAdmin();
  const setChannelOrder = useSetChannelOrder();

  const [draggedTextChannel, setDraggedTextChannel] = useState<string | null>(null);
  const [draggedVoiceChannel, setDraggedVoiceChannel] = useState<string | null>(null);

  // Apply persisted ordering to channels
  const orderedTextChannels = applyOrderingToTextChannels(category, persistedOrdering ?? null);
  const orderedVoiceChannels = applyOrderingToVoiceChannels(category, persistedOrdering ?? null);

  const handleTextChannelDragStart = (channelId: string) => {
    if (!isAdmin) return;
    setDraggedTextChannel(channelId);
  };

  const handleTextChannelDragOver = (e: React.DragEvent, targetChannelId: string) => {
    if (!isAdmin || !draggedTextChannel) return;
    e.preventDefault();
  };

  const handleTextChannelDrop = (e: React.DragEvent, targetChannelId: string) => {
    e.preventDefault();
    if (!isAdmin || !draggedTextChannel || draggedTextChannel === targetChannelId) {
      setDraggedTextChannel(null);
      return;
    }

    const currentOrder = orderedTextChannels.map(ch => ch.id);
    const draggedIndex = currentOrder.findIndex(id => id === draggedTextChannel);
    const targetIndex = currentOrder.findIndex(id => id === targetChannelId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTextChannel(null);
      return;
    }

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedTextChannel);

    setChannelOrder.mutate({
      serverId,
      categoryId: category.id,
      newOrder,
    });

    setDraggedTextChannel(null);
  };

  const handleVoiceChannelDragStart = (channelId: string) => {
    if (!isAdmin) return;
    setDraggedVoiceChannel(channelId);
  };

  const handleVoiceChannelDragOver = (e: React.DragEvent, targetChannelId: string) => {
    if (!isAdmin || !draggedVoiceChannel) return;
    e.preventDefault();
  };

  const handleVoiceChannelDrop = (e: React.DragEvent, targetChannelId: string) => {
    e.preventDefault();
    if (!isAdmin || !draggedVoiceChannel || draggedVoiceChannel === targetChannelId) {
      setDraggedVoiceChannel(null);
      return;
    }

    const currentOrder = orderedVoiceChannels.map(ch => ch.id);
    const draggedIndex = currentOrder.findIndex(id => id === draggedVoiceChannel);
    const targetIndex = currentOrder.findIndex(id => id === targetChannelId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedVoiceChannel(null);
      return;
    }

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedVoiceChannel);

    setChannelOrder.mutate({
      serverId,
      categoryId: category.id,
      newOrder,
    });

    setDraggedVoiceChannel(null);
  };

  return (
    <div className="mb-2">
      <button
        onClick={() => onToggleExpanded(category.id)}
        className="flex w-full items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors group"
      >
        {category.isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span className="flex-1 text-left">{category.name}</span>
        {isAdmin && (
          <Plus
            className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setCreateDialogOpen(true);
            }}
          />
        )}
      </button>

      {category.isExpanded && (
        <div className="space-y-0.5">
          {orderedTextChannels.map((channel: TextChannel) => (
            <div
              key={channel.id}
              draggable={isAdmin}
              onDragStart={() => handleTextChannelDragStart(channel.id)}
              onDragOver={(e) => handleTextChannelDragOver(e, channel.id)}
              onDrop={(e) => handleTextChannelDrop(e, channel.id)}
              onClick={() => selectChannel(channel.id, 'text')}
              className={`flex items-center gap-2 px-2 py-1.5 mx-2 rounded cursor-pointer transition-colors ${
                selectedChannelId === channel.id && selectedChannelType === 'text'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              } ${isAdmin ? 'cursor-move' : ''}`}
            >
              <Hash className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{channel.name}</span>
            </div>
          ))}

          {orderedVoiceChannels.map((channel: VoiceChannel) => (
            <div
              key={channel.id}
              draggable={isAdmin}
              onDragStart={() => handleVoiceChannelDragStart(channel.id)}
              onDragOver={(e) => handleVoiceChannelDragOver(e, channel.id)}
              onDrop={(e) => handleVoiceChannelDrop(e, channel.id)}
              onClick={() => selectChannel(channel.id, 'voice')}
              className={`flex items-center gap-2 px-2 py-1.5 mx-2 rounded cursor-pointer transition-colors ${
                selectedChannelId === channel.id && selectedChannelType === 'voice'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              } ${isAdmin ? 'cursor-move' : ''}`}
            >
              <Volume2 className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{channel.name}</span>
            </div>
          ))}
        </div>
      )}

      <CreateChannelDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        serverId={serverId}
        categoryId={category.id}
      />
    </div>
  );
}
