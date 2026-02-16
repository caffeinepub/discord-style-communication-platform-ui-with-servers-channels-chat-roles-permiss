import { useNavigation } from '../../state/navigation';
import DMHomeView from '../dms/DMHomeView';
import ChatView from '../chat/ChatView';
import VoiceView from '../voice/VoiceView';
import StageView from '../voice/StageView';
import DiscoveryView from '../discovery/DiscoveryView';
import ServerSettingsShell from '../settings/ServerSettings/ServerSettingsShell';
import UserSettingsShell from '../settings/UserSettings/UserSettingsShell';

export default function MainContent() {
  const { currentView, selectedChannelType, showServerSettings, showUserSettings } = useNavigation();

  if (showUserSettings) {
    return <UserSettingsShell />;
  }

  if (showServerSettings) {
    return <ServerSettingsShell />;
  }

  if (currentView === 'home') {
    return <DMHomeView />;
  }

  if (currentView === 'discovery') {
    return <DiscoveryView />;
  }

  if (currentView === 'server') {
    if (selectedChannelType === 'text') {
      return <ChatView />;
    }
    if (selectedChannelType === 'voice') {
      return <VoiceView />;
    }
    if (selectedChannelType === 'stage') {
      return <StageView />;
    }
    return (
      <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
        <p>Select a channel to get started</p>
      </div>
    );
  }

  return null;
}
