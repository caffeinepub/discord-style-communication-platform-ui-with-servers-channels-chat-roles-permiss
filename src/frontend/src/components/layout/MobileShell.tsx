import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Users, Hash } from 'lucide-react';
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
  const { currentView, selectedServerId } = useNavigation();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <MobileTopBar
        onOpenServers={() => setShowServers(true)}
        onOpenChannels={() => setShowChannels(true)}
        onOpenMembers={() => setShowMembers(true)}
      />

      <div className="flex-1 overflow-hidden">
        <MainContent />
      </div>

      <Sheet open={showServers} onOpenChange={setShowServers}>
        <SheetContent side="left" className="w-20 p-0">
          <ServerRail />
        </SheetContent>
      </Sheet>

      <Sheet open={showChannels} onOpenChange={setShowChannels}>
        <SheetContent side="left" className="w-64 p-0">
          <ChannelSidebar />
        </SheetContent>
      </Sheet>

      {currentView === 'server' && selectedServerId && (
        <Sheet open={showMembers} onOpenChange={setShowMembers}>
          <SheetContent side="right" className="w-64 p-0">
            <MemberListPanel />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
