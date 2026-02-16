import { Button } from '@/components/ui/button';
import { Menu, Hash, Users, Settings } from 'lucide-react';
import { useNavigation } from '../../state/navigation';
import { useGetServer } from '../../hooks/useQueries';

interface MobileTopBarProps {
  onOpenServers: () => void;
  onOpenChannels: () => void;
  onOpenMembers: () => void;
}

export default function MobileTopBar({ onOpenServers, onOpenChannels, onOpenMembers }: MobileTopBarProps) {
  const { currentView, selectedServerId, setShowUserSettings } = useNavigation();
  const { data: server } = useGetServer(selectedServerId);

  return (
    <div className="flex h-14 items-center justify-between bg-[oklch(0.21_0.01_250)] px-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onOpenServers}>
          <Menu className="h-5 w-5" />
        </Button>
        {currentView === 'server' && (
          <Button variant="ghost" size="icon" onClick={onOpenChannels}>
            <Hash className="h-5 w-5" />
          </Button>
        )}
      </div>

      <h1 className="font-semibold truncate">
        {currentView === 'home' && 'Home'}
        {currentView === 'server' && server && server.name}
        {currentView === 'discovery' && 'Discover'}
      </h1>

      <div className="flex items-center gap-2">
        {currentView === 'server' && (
          <Button variant="ghost" size="icon" onClick={onOpenMembers}>
            <Users className="h-5 w-5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => setShowUserSettings(true)}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
