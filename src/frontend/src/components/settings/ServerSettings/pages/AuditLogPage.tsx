import { useNavigation } from '../../../../state/navigation';
import { useGetServerAuditLog } from '../../../../hooks/useQueries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { AuditLogEntry, AuditEventType } from '../../../../backend';

function formatEventType(eventType: AuditEventType): string {
  const typeMap: Record<string, string> = {
    ServerCreated: 'Server Created',
    ServerRenamed: 'Server Renamed',
    SettingsUpdated: 'Settings Updated',
    CategoryAdded: 'Category Added',
    TextChannelAdded: 'Text Channel Added',
    VoiceChannelAdded: 'Voice Channel Added',
    ChannelMoved: 'Channel Moved',
    RoleAdded: 'Role Added',
    RolePermissionsSet: 'Role Permissions Updated',
    RoleAssignedToUser: 'Role Assigned',
    RoleRemovedFromUser: 'Role Removed',
    MessageSent: 'Message Sent',
    UserJoinedVoiceChannel: 'Joined Voice Channel',
    UserLeftVoiceChannel: 'Left Voice Channel',
    ServerJoined: 'User Joined Server',
    ServerLeft: 'User Left Server',
  };
  return typeMap[eventType] || eventType;
}

function formatTimestamp(timestamp: bigint): string {
  try {
    const milliseconds = Number(timestamp) / 1_000_000;
    const date = new Date(milliseconds);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

function formatPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
}

export default function AuditLogPage() {
  const { selectedServerId } = useNavigation();
  const { data: auditLog = [], isLoading, error } = useGetServerAuditLog(selectedServerId);

  if (!selectedServerId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No server selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Loading audit log...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Failed to load audit log</p>
        <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  if (auditLog.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No audit log entries yet</p>
        <p className="text-sm mt-2">Server actions will be recorded here</p>
      </div>
    );
  }

  // Sort by timestamp descending (newest first)
  const sortedLog = [...auditLog].sort((a, b) => {
    const aTime = Number(a.timestamp);
    const bTime = Number(b.timestamp);
    return bTime - aTime;
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Audit Log</h3>
        <p className="text-sm text-muted-foreground">
          View all server actions and changes
        </p>
      </div>

      <Separator />

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {sortedLog.map((entry) => (
            <div
              key={entry.id.toString()}
              className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {formatEventType(entry.eventType)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by {formatPrincipal(entry.userId.toString())}
                    </span>
                  </div>
                  {entry.details && (
                    <p className="text-sm text-muted-foreground mt-1 break-words">
                      {entry.details}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(entry.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
