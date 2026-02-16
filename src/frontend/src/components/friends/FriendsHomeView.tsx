import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetFriends, useGetFriendRequests, useSendFriendRequest, useAcceptFriendRequest, useDeclineFriendRequest } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import FriendRow from './FriendRow';

export default function FriendsHomeView() {
  const [friendInput, setFriendInput] = useState('');
  const { data: friends = [] } = useGetFriends();
  const { data: requests = [] } = useGetFriendRequests();
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendInput.trim()) return;

    try {
      const principal = Principal.fromText(friendInput.trim());
      await sendRequest.mutateAsync(principal);
      setFriendInput('');
    } catch (error) {
      toast.error('Invalid principal ID');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex h-12 items-center px-4 border-b border-border">
        <h2 className="font-semibold">Friends</h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
              <TabsTrigger value="add">Add Friend</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto px-4 pb-4">
            <TabsContent value="online" className="mt-4">
              <div className="space-y-2">
                {friends.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No friends online</p>
                )}
                {friends.map((friendId) => (
                  <FriendRow key={friendId.toString()} friendId={friendId} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-2">
                {friends.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No friends yet</p>
                )}
                {friends.map((friendId) => (
                  <FriendRow key={friendId.toString()} friendId={friendId} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <div className="space-y-2">
                {requests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No pending requests</p>
                )}
                {requests.map((request) => (
                  <div
                    key={request.from.toString()}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/30"
                  >
                    <span className="text-sm font-medium">{request.from.toString().slice(0, 10)}...</span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptRequest.mutate(request.from)}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => declineRequest.mutate(request.from)}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="blocked" className="mt-4">
              <p className="text-center text-muted-foreground py-8">No blocked users</p>
            </TabsContent>

            <TabsContent value="add" className="mt-4">
              <form onSubmit={handleAddFriend} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="friend-id">Friend's Principal ID</Label>
                  <Input
                    id="friend-id"
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    placeholder="Enter principal ID"
                  />
                </div>
                <Button type="submit" disabled={!friendInput.trim() || sendRequest.isPending}>
                  Send Friend Request
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
