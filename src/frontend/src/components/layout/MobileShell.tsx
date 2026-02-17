import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import ServerRail from '../nav/ServerRail';
import ChannelSidebar from '../nav/ChannelSidebar';
import MemberListPanel from '../members/MemberListPanel';
import MainContent from './MainContent';
import MobileTopBar from '../nav/MobileTopBar';
import { useNavigation } from '../../state/navigation';

export default function MobileShell() {
  const [showServers, setShowServers] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const { currentView, selectedServerId, setShowUserSettings } = useNavigation();

  const handleOpenSettings = () => {
    // Close all sheets when opening settings
    setShowServers(false);
    setShowChannels(false);
    setShowMembers(false);
    setShowUserSettings(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <MobileTopBar
        onMenuClick={() => setShowChannels(true)}
        onMembersClick={() => setShowMembers(true)}
      />

      <div className="flex-1 overflow-hidden">
        <MainContent />
      </div>

      <Sheet open={showServers} onOpenChange={setShowServers}>
        <SheetContent side="left" className="w-20 p-0 flex flex-col">
          <div className="flex-1">
            <ServerRail />
          </div>
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={handleOpenSettings}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showChannels} onOpenChange={setShowChannels}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChannelSidebar serverId={selectedServerId} />
          </div>
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleOpenSettings}
            >
              <Settings className="mr-2 h-4 w-4" />
              User Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {currentView === 'server' && selectedServerId && (
        <Sheet open={showMembers} onOpenChange={setShowMembers}>
          <SheetContent side="right" className="w-64 p-0 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <MemberListPanel serverId={selectedServerId} />
            </div>
            <div className="p-2 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleOpenSettings}
              >
                <Settings className="mr-2 h-4 w-4" />
                User Settings
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
