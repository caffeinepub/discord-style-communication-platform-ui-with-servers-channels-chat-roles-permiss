import { Home, Plus, Compass, Settings } from 'lucide-react';
import { useNavigation } from '../../state/navigation';
import { useGetAllServers } from '../../hooks/useQueries';
import ServerIcon from '../servers/ServerIcon';
import { useState } from 'react';
import CreateServerDialog from '../servers/CreateServerDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Server as BackendServer } from '../../backend';

export default function ServerRail() {
  const { currentView, selectedServerId, goHome, selectServer, setCurrentView } = useNavigation();
  const { data: servers = [], isLoading } = useGetAllServers();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleServerClick = (serverId: string) => {
    selectServer(serverId);
  };

  return (
    <TooltipProvider>
      <div className="w-[72px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border flex flex-col items-center py-3 gap-2">
        {/* Home Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={goHome}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl ${
                currentView === 'home'
                  ? 'bg-primary text-primary-foreground rounded-xl'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <Home className="w-6 h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Home</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-8 h-[2px] bg-border rounded-full my-1" />

        {/* Server List */}
        <div className="flex-1 w-full overflow-y-auto space-y-2 px-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {isLoading ? (
            <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse" />
          ) : Array.isArray(servers) && servers.length > 0 ? (
            servers.map((server: BackendServer) => (
              <Tooltip key={server.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleServerClick(server.id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl ${
                      selectedServerId === server.id
                        ? 'rounded-xl'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    <ServerIcon server={server} size="md" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{server.name}</p>
                </TooltipContent>
              </Tooltip>
            ))
          ) : null}
        </div>

        {/* Add Server Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground hover:bg-success hover:text-success-foreground hover:rounded-xl transition-all flex items-center justify-center"
            >
              <Plus className="w-6 h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a Server</p>
          </TooltipContent>
        </Tooltip>

        {/* Discover Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCurrentView('discovery')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl ${
                currentView === 'discovery'
                  ? 'bg-success text-success-foreground rounded-xl'
                  : 'bg-muted text-muted-foreground hover:bg-success/10 hover:text-success'
              }`}
            >
              <Compass className="w-6 h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Discover</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-8 h-[2px] bg-border rounded-full my-1" />

        {/* Profile Settings Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCurrentView('settings')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl ${
                currentView === 'settings'
                  ? 'bg-primary text-primary-foreground rounded-xl'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <Settings className="w-6 h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>User Settings</p>
          </TooltipContent>
        </Tooltip>

        <CreateServerDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </div>
    </TooltipProvider>
  );
}
