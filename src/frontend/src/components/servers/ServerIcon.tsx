import type { Server as BackendServer } from '../../backend';

interface ServerIconProps {
  server: BackendServer;
  size?: 'sm' | 'md' | 'lg';
}

export default function ServerIcon({ server, size = 'md' }: ServerIconProps) {
  if (server.iconURL) {
    return (
      <img
        src={server.iconURL}
        alt={server.name}
        className="h-full w-full rounded-2xl group-hover:rounded-xl transition-all object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl group-hover:rounded-xl transition-all bg-[oklch(0.35_0.05_250)] text-foreground font-semibold">
      {server.name.charAt(0).toUpperCase()}
    </div>
  );
}
