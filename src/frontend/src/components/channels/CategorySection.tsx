import { useState } from 'react';
import { ChevronDown, ChevronRight, Hash, Volume2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '../../state/navigation';
import type { ChannelCategory } from '../../backend';
import { cn } from '@/lib/utils';
import CreateChannelDialog from './CreateChannelDialog';

interface CategorySectionProps {
  category: ChannelCategory;
  serverId: bigint;
}

export default function CategorySection({ category, serverId }: CategorySectionProps) {
  const { selectedChannelId, selectChannel, expandedCategories, toggleCategory } = useNavigation();
  const isExpanded = expandedCategories[category.id.toString()] !== false;
  const [showCreateChannel, setShowCreateChannel] = useState(false);

  return (
    <div className="mb-2">
      <button
        className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors group"
        onClick={() => toggleCategory(category.id.toString())}
      >
        <div className="flex items-center gap-1">
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span>{category.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowCreateChannel(true);
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </button>

      {isExpanded && (
        <div className="space-y-0.5 mt-1">
          {category.textChannels.map((channel) => (
            <button
              key={channel.id.toString()}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
                selectedChannelId === channel.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
              onClick={() => selectChannel(channel.id, 'text')}
            >
              <Hash className="h-4 w-4 shrink-0" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}

          {category.voiceChannels.map((channel) => (
            <button
              key={channel.id.toString()}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
                selectedChannelId === channel.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
              onClick={() => selectChannel(channel.id, 'voice')}
            >
              <Volume2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      )}

      <CreateChannelDialog
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
        serverId={serverId}
        categoryId={category.id}
      />
    </div>
  );
}
