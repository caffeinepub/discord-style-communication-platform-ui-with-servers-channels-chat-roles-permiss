import { useBackendConnection } from '../../hooks/useBackendConnection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export function BackendConnectionBanner() {
  const { state, error, retry } = useBackendConnection();

  // Don't show banner when connection is ready
  if (state === 'ready') {
    return null;
  }

  // Show loading state
  if (state === 'loading') {
    return (
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Connecting to backend...
          </p>
        </div>
      </div>
    );
  }

  // Show error state with detailed recovery instructions
  if (state === 'error') {
    return (
      <div className="border-b border-destructive/50 bg-destructive/10 px-4 py-4">
        <Alert variant="destructive" className="border-0 bg-transparent p-0">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="mb-2">Backend Connection Error</AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="text-sm">
              {error || 'Unable to connect to the backend. The local replica may not be running.'}
            </p>
            
            <div className="text-sm space-y-2">
              <p className="font-medium">To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Stop the current replica: <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs">dfx stop</code></li>
                <li>Kill any hanging processes: <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs">killall dfx replica</code></li>
                <li>Start with a clean state: <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs">dfx start --clean --background</code></li>
                <li>Deploy the backend: <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs">dfx deploy backend</code></li>
                <li>Click the Retry button below</li>
              </ol>
            </div>

            <Button 
              onClick={retry} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
