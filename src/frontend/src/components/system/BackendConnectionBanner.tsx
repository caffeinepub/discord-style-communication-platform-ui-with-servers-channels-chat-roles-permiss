import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBackendConnection } from '@/hooks/useBackendConnection';

export default function BackendConnectionBanner() {
  const { state, error, retry } = useBackendConnection();

  if (state === 'loading') {
    return (
      <div className="border-b border-border bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Connecting to backend...</span>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Connection Error</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{error || 'Backend is not reachable. Please ensure the replica is running and try again.'}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
