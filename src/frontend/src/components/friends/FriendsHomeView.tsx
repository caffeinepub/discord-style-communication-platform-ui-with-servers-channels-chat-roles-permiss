import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Check, X } from 'lucide-react';
import FriendRow from './FriendRow';
import { useGetFriends, useGetFriendRequests, useSendFriendRequest, useAcceptFriendRequest, useDeclineFriendRequest } from '../../hooks/useQueries';
import { toast } from 'sonner';

export default function FriendsHomeView() {
  const [friendUsername, setFriendUsername] = useState('');
  const { data: friends = [] } = useGetFriends();
  const { data: friendRequests = [] } = useGetFriendRequests();
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendUsername.trim()) return;

    try {
      await sendRequest.mutateAsync(friendUsername.trim());
      setFriendUsername('');
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleAccept = async (username: string) => {
    try {
      await acceptRequest.mutateAsync(username);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleDecline = async (username: string) => {
    try {
      await declineRequest.mutateAsync(username);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex h-12 items-center px-4 border-b border-border">
        <h2 className="font-semibold">Friends</h2>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
          <TabsTrigger value="online">Online</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
          <TabsTrigger value="add" className="ml-auto text-success">
            Add Friend
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="online" className="p-4 space-y-2 mt-0">
            {friends.filter(() => false).map((username) => (
              <FriendRow key={username} username={username} />
            ))}
            {friends.filter(() => false).length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p>No friends online</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="p-4 space-y-2 mt-0">
            {friends.map((username) => (
              <FriendRow key={username} username={username} />
            ))}
            {friends.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p>No friends yet</p>
                <p className="text-sm mt-2">Add friends to start chatting</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="p-4 space-y-2 mt-0">
            {friendRequests.map((request) => (
              <div
                key={request.from}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <FriendRow username={request.from} />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                    onClick={() => handleAccept(request.from)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDecline(request.from)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {friendRequests.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p>No pending friend requests</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocked" className="p-4 space-y-2 mt-0">
            <div className="text-center text-muted-foreground py-12">
              <p>No blocked users</p>
            </div>
          </TabsContent>

          <TabsContent value="add" className="p-4 mt-0">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-2">Add Friend</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You can add friends by their username.
              </p>
              <form onSubmit={handleSendRequest} className="flex gap-2">
                <Input
                  placeholder="Enter username"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!friendUsername.trim() || sendRequest.isPending}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {sendRequest.isPending ? 'Sending...' : 'Send Request'}
                </Button>
              </form>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
