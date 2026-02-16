import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useDiscoverServers, useJoinServer } from '../../hooks/useQueries';
import ServerPreviewCard from './ServerPreviewCard';

export default function DiscoveryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: servers = [] } = useDiscoverServers();
  const joinServer = useJoinServer();

  const filteredServers = servers.filter((server) =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex h-12 items-center px-4 border-b border-border">
        <h2 className="font-semibold">Discover Servers</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search servers..."
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server) => (
            <ServerPreviewCard
              key={server.id.toString()}
              server={server}
              onJoin={() => joinServer.mutate(server.id)}
            />
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No servers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
