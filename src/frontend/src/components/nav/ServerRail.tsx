import { Plus, Home, Compass, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../../state/navigation';
import { useGetAllServers, useGetServerOrdering } from '../../hooks/useQueries';
import { useState } from 'react';
import CreateServerDialog from '../servers/CreateServerDialog';
import ServerIcon from '../servers/ServerIcon';
import { cn } from '@/lib/utils';
import { useBackendActionGuard } from '@/hooks/useBackendActionGuard';

export default function ServerRail() {
  const { currentView, selectedServerId, goHome, selectServer, setCurrentView, setShowUserSettings } = useNavigation();
  const { data: servers = [] } = useGetAllServers();
  const { data: ordering = [] } = useGetServerOrdering();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { disabled: backendDisabled, reason: backendReason } = useBackendActionGuard();

  const orderedServers = [...servers].sort((a, b) => {
    const aIndex = ordering.findIndex((id) => id === a.id);
    const bIndex = ordering.findIndex((id) => id === b.id);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <>
      <div className="flex w-20 flex-col items-center gap-2 bg-[oklch(0.18_0.01_250)] py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-12 w-12 rounded-2xl transition-all hover:rounded-xl',
                currentView === 'home' && 'rounded-xl bg-primary text-primary-foreground'
              )}
              onClick={goHome}
            >
              <Home className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Home</TooltipContent>
        </Tooltip>

        <div className="h-0.5 w-8 bg-border" />

        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-2 px-3">
            {orderedServers.map((server) => (
              <Tooltip key={server.id.toString()}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => selectServer(server.id)}
                    className={cn(
                      'relative h-12 w-12 rounded-2xl transition-all hover:rounded-xl group',
                      selectedServerId === server.id && 'rounded-xl'
                    )}
                  >
                    <ServerIcon server={server} />
                    {selectedServerId === server.id && (
                      <div className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 h-10 w-1 bg-foreground rounded-r" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{server.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </ScrollArea>

        <div className="h-0.5 w-8 bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-2xl bg-background hover:rounded-xl hover:bg-[oklch(0.45_0.15_145)]"
                onClick={() => setShowCreateDialog(true)}
                disabled={backendDisabled}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">
            {backendDisabled && backendReason ? backendReason : 'Add a Server'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-12 w-12 rounded-2xl hover:rounded-xl hover:bg-[oklch(0.45_0.15_145)]',
                currentView === 'discovery' && 'rounded-xl bg-[oklch(0.45_0.15_145)]'
              )}
              onClick={() => setCurrentView('discovery')}
            >
              <Compass className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Discover</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl hover:rounded-xl hover:bg-[oklch(0.45_0.15_145)]"
              onClick={() => setShowUserSettings(true)}
            >
              <Settings className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">User Settings</TooltipContent>
        </Tooltip>
      </div>

      <CreateServerDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  );
}
