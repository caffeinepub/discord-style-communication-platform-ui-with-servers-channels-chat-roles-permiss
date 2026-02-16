import { Button } from '@/components/ui/button';
import { Hand, Mic, MicOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function StageView() {
  const speakers = [
    { id: '1', name: 'Speaker 1' },
    { id: '2', name: 'Speaker 2' },
  ];

  const audience = [
    { id: '3', name: 'Listener 1' },
    { id: '4', name: 'Listener 2' },
    { id: '5', name: 'Listener 3' },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex h-12 items-center px-4 border-b border-border">
        <h2 className="font-semibold">Stage Channel</h2>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Speakers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {speakers.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-accent/30">
                <Avatar className="h-16 w-16 ring-2 ring-green-500">
                  <AvatarImage src={`/assets/generated/avatar-default-0${parseInt(s.id)}.dim_256x256.png`} />
                  <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-center">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
            Audience — {audience.length}
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {audience.map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/assets/generated/avatar-default-0${parseInt(a.id)}.dim_256x256.png`} />
                  <AvatarFallback>{a.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-center truncate w-full">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-6 border-t border-border bg-accent/20">
        <Button size="lg" variant="secondary">
          <Hand className="mr-2 h-5 w-5" />
          Raise Hand
        </Button>
      </div>
    </div>
  );
}
