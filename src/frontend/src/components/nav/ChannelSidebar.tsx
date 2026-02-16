import { useState } from 'react';
import { useNavigation } from '../../state/navigation';
import { useGetServer, useGetCategories } from '../../hooks/useQueries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Settings, ChevronDown, Hash, Volume2, Users, Plus } from 'lucide-react';
import CategorySection from '../channels/CategorySection';
import CreateCategoryDialog from '../channels/CreateCategoryDialog';
import { cn } from '@/lib/utils';

export default function ChannelSidebar() {
  const { currentView, selectedServerId, homeTab, setHomeTab, setShowServerSettings } = useNavigation();
  const { data: server } = useGetServer(selectedServerId);
  const { data: categories = [] } = useGetCategories(selectedServerId);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  if (currentView === 'home') {
    return (
      <div className="flex w-60 flex-col bg-[oklch(0.21_0.01_250)]">
        <div className="flex h-12 items-center justify-between px-4 shadow-sm border-b border-border">
          <h2 className="font-semibold">Direct Messages</h2>
        </div>
        <div className="flex flex-col p-2">
          <Button
            variant="ghost"
            className={cn(
              'justify-start',
              homeTab === 'friends' && 'bg-accent text-accent-foreground'
            )}
            onClick={() => setHomeTab('friends')}
          >
            <Users className="mr-2 h-4 w-4" />
            Friends
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'justify-start',
              homeTab === 'dms' && 'bg-accent text-accent-foreground'
            )}
            onClick={() => setHomeTab('dms')}
          >
            <Hash className="mr-2 h-4 w-4" />
            Direct Messages
          </Button>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex w-60 flex-col bg-[oklch(0.21_0.01_250)]">
        <div className="flex h-12 items-center px-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-col bg-[oklch(0.21_0.01_250)]">
      <button
        className="flex h-12 items-center justify-between px-4 shadow-sm border-b border-border hover:bg-accent/50 transition-colors"
        onClick={() => setShowServerSettings(true)}
      >
        <h2 className="font-semibold truncate">{server.name}</h2>
        <ChevronDown className="h-4 w-4 shrink-0" />
      </button>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {categories.map((category) => (
            <CategorySection key={category.id.toString()} category={category} serverId={server.id} />
          ))}
          
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
            onClick={() => setShowCreateCategory(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>
      </ScrollArea>

      <CreateCategoryDialog
        open={showCreateCategory}
        onOpenChange={setShowCreateCategory}
        serverId={server.id}
      />
    </div>
  );
}
