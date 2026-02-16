import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Server } from '../../types/local';
import { useJoinServer } from '../../hooks/useQueries';
import { Users } from 'lucide-react';

interface ServerPreviewCardProps {
  server: Server;
}

export default function ServerPreviewCard({ server }: ServerPreviewCardProps) {
  const joinServerMutation = useJoinServer();

  const handleJoin = () => {
    joinServerMutation.mutate(server.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{server.name}</CardTitle>
        <CardDescription>{server.description || 'No description'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{server.members.length} members</span>
          </div>
          <Button onClick={handleJoin} disabled={joinServerMutation.isPending}>
            {joinServerMutation.isPending ? 'Joining...' : 'Join Server'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
