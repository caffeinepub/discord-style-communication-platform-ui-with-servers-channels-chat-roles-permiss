import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Hash, Pin, Search } from 'lucide-react';
import ChatComposer from './ChatComposer';
import MessageItem from './MessageItem';
import { useNavigation } from '@/state/navigation';
import { useGetTextChannelMessages } from '@/hooks/useQueries';
import { useGetCategories } from '@/hooks/useQueries';

export default function ChatView() {
  const { selectedServerId, selectedChannelId } = useNavigation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages for the selected channel
  const { data: messages = [], isLoading } = useGetTextChannelMessages(selectedServerId, selectedChannelId);

  // Fetch categories to get channel name
  const { data: categories = [] } = useGetCategories(selectedServerId);

  // Find the current channel name
  const channelName = categories
    .flatMap((cat) => cat.textChannels)
    .find((ch) => ch.id === selectedChannelId)?.name || 'channel';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Show empty state if no server/channel is selected
  if (!selectedServerId || !selectedChannelId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-muted-foreground">
        <Hash className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">Select a text channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex h-12 items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">{channelName}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Pin className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Hash className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => <MessageItem key={msg.id.toString()} message={msg} />)
          )}
        </div>
      </ScrollArea>

      <div className="p-4">
        <ChatComposer channelName={channelName} />
      </div>
    </div>
  );
}
