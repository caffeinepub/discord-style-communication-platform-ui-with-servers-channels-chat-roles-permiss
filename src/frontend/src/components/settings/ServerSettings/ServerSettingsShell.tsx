import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../../../state/navigation';
import { OverviewPage } from './pages/OverviewPage';
import { RolesPage } from './pages/RolesPage';
import { ChannelsPage } from './pages/ChannelsPage';
import AuditLogPage from './pages/AuditLogPage';

type SettingsPage = 'overview' | 'roles' | 'channels' | 'audit-log';

export default function ServerSettingsShell() {
  const [currentPage, setCurrentPage] = useState<SettingsPage>('overview');
  const { setShowServerSettings, selectedServerId } = useNavigation();

  const renderPage = () => {
    if (!selectedServerId) return null;

    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'roles':
        return <RolesPage />;
      case 'channels':
        return <ChannelsPage serverId={selectedServerId} />;
      case 'audit-log':
        return <AuditLogPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-60 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Server Settings</h2>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            <Button
              variant={currentPage === 'overview' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentPage('overview')}
            >
              Overview
            </Button>
            <Button
              variant={currentPage === 'roles' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentPage('roles')}
            >
              Roles
            </Button>
            <Button
              variant={currentPage === 'channels' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentPage('channels')}
            >
              Channels
            </Button>
            <Button
              variant={currentPage === 'audit-log' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentPage('audit-log')}
            >
              Audit Log
            </Button>
          </nav>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold capitalize">{currentPage.replace('-', ' ')}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowServerSettings(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6">{renderPage()}</div>
        </ScrollArea>
      </div>
    </div>
  );
}
