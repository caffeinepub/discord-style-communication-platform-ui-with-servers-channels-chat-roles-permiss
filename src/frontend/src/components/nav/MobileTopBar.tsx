import { Menu, Hash, Volume2, Users } from 'lucide-react';
import { useNavigation } from '../../state/navigation';
import { useGetServer } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileTopBarProps {
  onMenuClick: () => void;
  onMembersClick: () => void;
}

export default function MobileTopBar({ onMenuClick, onMembersClick }: MobileTopBarProps) {
  const { currentView, selectedServerId, selectedChannelId, selectedChannelType, homeTab } = useNavigation();
  const { data: server, isLoading: serverLoading } = useGetServer(selectedServerId);

  const getTitle = () => {
    if (currentView === 'home') {
      return homeTab === 'dms' ? 'Direct Messages' : 'Friends';
    }
    if (currentView === 'discovery') {
      return 'Discover Servers';
    }
    if (currentView === 'settings') {
      return 'Settings';
    }
    if (currentView === 'server') {
      if (serverLoading) {
        return <Skeleton className="h-5 w-32" />;
      }
      if (selectedChannelId) {
        return (
          <div className="flex items-center gap-2">
            {selectedChannelType === 'text' ? (
              <Hash className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            )}
            <span>Channel Name</span>
          </div>
        );
      }
      return server?.name || 'Server';
    }
    return 'Caffeine Chat';
  };

  return (
    <div className="h-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-4">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 hover:bg-accent rounded-md transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 text-center font-semibold truncate px-2">
        {getTitle()}
      </div>

      {currentView === 'server' && (
        <button
          onClick={onMembersClick}
          className="p-2 -mr-2 hover:bg-accent rounded-md transition-colors"
        >
          <Users className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
