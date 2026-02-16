import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import type { Server } from '../../backend';

interface ServerPreviewCardProps {
  server: Server;
  onJoin: () => void;
}

export default function ServerPreviewCard({ server, onJoin }: ServerPreviewCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5" />
      <CardHeader className="-mt-8">
        <div className="flex items-start justify-between">
          <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center text-2xl font-bold shadow-lg">
            {server.name.charAt(0)}
          </div>
        </div>
        <CardTitle className="mt-2">{server.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {server.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{server.members.length} members</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onJoin}>
          Join Server
        </Button>
      </CardFooter>
    </Card>
  );
}
