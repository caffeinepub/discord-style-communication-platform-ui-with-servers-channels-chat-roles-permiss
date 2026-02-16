interface NotificationOverride {
  muted: boolean;
  muteDuration?: number;
  level?: 'all' | 'mentions' | 'none';
}

const STORAGE_KEY = 'notificationOverrides';

export function getNotificationOverrides(): Record<string, NotificationOverride> {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function setNotificationOverride(key: string, override: NotificationOverride) {
  const overrides = getNotificationOverrides();
  overrides[key] = override;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function isChannelMuted(serverId: string, channelId: string): boolean {
  const overrides = getNotificationOverrides();
  const key = `${serverId}-${channelId}`;
  return overrides[key]?.muted || false;
}

export function isServerMuted(serverId: string): boolean {
  const overrides = getNotificationOverrides();
  return overrides[serverId]?.muted || false;
}
