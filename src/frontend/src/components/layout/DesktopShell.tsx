import ServerRail from '../nav/ServerRail';
import { ChannelSidebar } from '../nav/ChannelSidebar';
import MemberListPanel from '../members/MemberListPanel';
import MainContent from './MainContent';
import { useNavigation } from '../../state/navigation';

export default function DesktopShell() {
  const { currentView, selectedServerId } = useNavigation();
  const showMemberList = currentView === 'server' && selectedServerId !== null;

  return (
    <div className="flex h-screen overflow-hidden">
      <ServerRail />
      {(currentView === 'server' || currentView === 'home') && <ChannelSidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <MainContent />
      </div>
      {showMemberList && selectedServerId && <MemberListPanel serverId={selectedServerId} />}
    </div>
  );
}
