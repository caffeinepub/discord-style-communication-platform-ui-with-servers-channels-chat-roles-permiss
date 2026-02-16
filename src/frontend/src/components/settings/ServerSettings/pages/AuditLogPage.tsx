import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetAuditLog } from '../../../../hooks/useQueries';
import { useNavigation } from '../../../../state/navigation';
import { Loader2 } from 'lucide-react';
import type { AuditLogEntry, AuditEventType } from '../../../../types/local';

export default function AuditLogPage() {
  const { selectedServerId } = useNavigation();
  const { data: auditLog = [], isLoading } = useGetAuditLog(selectedServerId);

  const formatEventType = (eventType: AuditEventType): string => {
    if ('ServerCreated' in eventType) return 'Server Created';
    if ('ServerRenamed' in eventType) return 'Server Renamed';
    if ('SettingsUpdated' in eventType) return 'Settings Updated';
    if ('CategoryAdded' in eventType) return 'Category Added';
    if ('TextChannelAdded' in eventType) return 'Text Channel Added';
    if ('VoiceChannelAdded' in eventType) return 'Voice Channel Added';
    if ('ChannelMoved' in eventType) return 'Channel Moved';
    if ('RoleAdded' in eventType) return 'Role Added';
    if ('RolePermissionsSet' in eventType) return 'Role Permissions Set';
    if ('RoleAssignedToUser' in eventType) return 'Role Assigned';
    if ('RoleRemovedFromUser' in eventType) return 'Role Removed';
    if ('MessageSent' in eventType) return 'Message Sent';
    if ('UserJoinedVoiceChannel' in eventType) return 'User Joined Voice';
    if ('UserLeftVoiceChannel' in eventType) return 'User Left Voice';
    if ('ServerJoined' in eventType) return 'Server Joined';
    if ('ServerLeft' in eventType) return 'Server Left';
    return 'Unknown Event';
  };

  const formatTimestamp = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (auditLog.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No audit log entries</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Audit Log</h3>
        <p className="text-sm text-muted-foreground">
          View all actions performed on this server
        </p>
      </div>

      <ScrollArea className="h-[600px] border rounded-lg">
        <div className="p-4 space-y-3">
          {auditLog.map((entry: AuditLogEntry) => (
            <div
              key={entry.id.toString()}
              className="border-b pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{formatEventType(entry.eventType)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    By: {entry.userId.slice(0, 16)}...
                  </p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
