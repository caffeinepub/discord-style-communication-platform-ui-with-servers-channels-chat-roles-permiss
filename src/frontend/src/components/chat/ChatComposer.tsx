import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Smile, Gift, Send } from 'lucide-react';
import { useNavigation } from '@/state/navigation';
import { useSendTextChannelMessage } from '@/hooks/useQueries';
import { useBackendActionGuard } from '@/hooks/useBackendActionGuard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatComposerProps {
  channelName: string;
}

export default function ChatComposer({ channelName }: ChatComposerProps) {
  const [message, setMessage] = useState('');
  const { selectedServerId, selectedChannelId } = useNavigation();
  const sendMessage = useSendTextChannelMessage();
  const { disabled: backendDisabled, reason: backendReason } = useBackendActionGuard();

  const handleSend = async () => {
    if (!message.trim() || !selectedServerId || !selectedChannelId || backendDisabled) return;

    try {
      await sendMessage.mutateAsync({
        serverId: selectedServerId,
        textChannelId: selectedChannelId,
        content: message.trim(),
      });
      setMessage('');
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Failed to send message:', error);
    }
  };

  const isSendDisabled = !message.trim() || sendMessage.isPending || backendDisabled;

  return (
    <div className="rounded-lg bg-accent/30 p-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={backendDisabled ? backendReason || 'Backend not ready' : `Message #${channelName}`}
        className="min-h-[44px] resize-none border-0 bg-transparent focus-visible:ring-0"
        disabled={sendMessage.isPending || backendDisabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !backendDisabled) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={backendDisabled}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={backendDisabled}>
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={backendDisabled}>
            <Gift className="h-4 w-4" />
          </Button>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button size="sm" onClick={handleSend} disabled={isSendDisabled}>
                {sendMessage.isPending ? (
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </span>
          </TooltipTrigger>
          {backendDisabled && backendReason && (
            <TooltipContent>{backendReason}</TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
}
