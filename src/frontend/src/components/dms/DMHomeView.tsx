import { useNavigation } from '../../state/navigation';
import FriendsHomeView from '../friends/FriendsHomeView';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hash } from 'lucide-react';

export default function DMHomeView() {
  const { homeTab } = useNavigation();

  if (homeTab === 'friends') {
    return <FriendsHomeView />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex h-12 items-center px-4 border-b border-border">
        <h2 className="font-semibold">Direct Messages</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No direct messages yet</p>
              <p className="text-sm mt-2">Start a conversation with a friend!</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
