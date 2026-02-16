import type { Server } from '../../types/local';

interface ServerIconProps {
  server: Server;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ServerIcon({ server, isSelected = false, onClick }: ServerIconProps) {
  const iconUrl = server.iconUrl || '/assets/generated/server-placeholder.dim_128x128.png';

  return (
    <button
      onClick={onClick}
      className={`relative w-12 h-12 rounded-2xl overflow-hidden transition-all hover:rounded-xl ${
        isSelected ? 'rounded-xl' : ''
      }`}
      title={server.name}
    >
      <img src={iconUrl} alt={server.name} className="w-full h-full object-cover" />
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-1 h-8 bg-foreground rounded-r" />
      )}
    </button>
  );
}
