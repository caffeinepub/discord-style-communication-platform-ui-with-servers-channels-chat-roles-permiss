import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { useNavigation } from '../../../state/navigation';
import OverviewPage from './pages/OverviewPage';
import RolesPage from './pages/RolesPage';
import ChannelsPage from './pages/ChannelsPage';
import AuditLogPage from './pages/AuditLogPage';
import { cn } from '@/lib/utils';

type SettingsPage = 'overview' | 'roles' | 'channels' | 'moderation' | 'audit' | 'integrations' | 'emoji';

export default function ServerSettingsShell() {
  const [currentPage, setCurrentPage] = useState<SettingsPage>('overview');
  const { selectedServerId, setShowServerSettings } = useNavigation();

  if (!selectedServerId) {
    return null;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'roles':
        return <RolesPage />;
      case 'channels':
        return <ChannelsPage serverId={selectedServerId} />;
      case 'audit':
        return <AuditLogPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-60 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Server Settings</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <Button
              variant={currentPage === 'overview' ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', currentPage === 'overview' && 'bg-accent')}
              onClick={() => setCurrentPage('overview')}
            >
              Overview
            </Button>
            <Button
              variant={currentPage === 'roles' ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', currentPage === 'roles' && 'bg-accent')}
              onClick={() => setCurrentPage('roles')}
            >
              Roles
            </Button>
            <Button
              variant={currentPage === 'channels' ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', currentPage === 'channels' && 'bg-accent')}
              onClick={() => setCurrentPage('channels')}
            >
              Channels
            </Button>
            <Button
              variant={currentPage === 'audit' ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', currentPage === 'audit' && 'bg-accent')}
              onClick={() => setCurrentPage('audit')}
            >
              Audit Log
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b border-border flex items-center justify-between px-4">
          <h1 className="font-semibold">
            {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowServerSettings(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6">{renderPage()}</div>
        </ScrollArea>
      </div>
    </div>
  );
}
