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

type SettingsPage = 'overview' | 'roles' | 'channels' | 'moderation' | 'audit' | 'integrations' | 'emoji' | 'boost' | 'safety' | 'community';

export default function ServerSettingsShell() {
  const [currentPage, setCurrentPage] = useState<SettingsPage>('overview');
  const { setShowServerSettings } = useNavigation();

  const pages = [
    { id: 'overview', label: 'Overview' },
    { id: 'roles', label: 'Roles' },
    { id: 'channels', label: 'Channels' },
    { id: 'moderation', label: 'Moderation' },
    { id: 'audit', label: 'Audit Log' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'emoji', label: 'Emoji & Stickers' },
    { id: 'boost', label: 'Server Boost' },
    { id: 'safety', label: 'Safety Setup' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <div className="flex h-full bg-background">
      <div className="w-60 bg-[oklch(0.21_0.01_250)] border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Server Settings</h2>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-2 space-y-1">
            {pages.map((page) => (
              <Button
                key={page.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  currentPage === page.id && 'bg-accent text-accent-foreground'
                )}
                onClick={() => setCurrentPage(page.id as SettingsPage)}
              >
                {page.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex h-12 items-center justify-between px-6 border-b border-border">
          <h3 className="font-semibold">{pages.find((p) => p.id === currentPage)?.label}</h3>
          <Button variant="ghost" size="icon" onClick={() => setShowServerSettings(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {currentPage === 'overview' && <OverviewPage />}
            {currentPage === 'roles' && <RolesPage />}
            {currentPage === 'channels' && <ChannelsPage />}
            {currentPage === 'audit' && <AuditLogPage />}
            {currentPage !== 'overview' && currentPage !== 'roles' && currentPage !== 'channels' && currentPage !== 'audit' && (
              <div className="text-center py-12 text-muted-foreground">
                <p>This section is coming soon</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
