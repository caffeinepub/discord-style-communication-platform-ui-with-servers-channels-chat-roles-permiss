import { useState } from 'react';
import { useIsCallerAdmin, useAdminWipeReplicaData, useAdminCheckWipeResult } from '../../../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminReplicaResetSection() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const wipeMutation = useAdminWipeReplicaData();
  const { data: verificationData, refetch: refetchVerification, isFetching: verificationFetching } = useAdminCheckWipeResult();

  const [confirmationText, setConfirmationText] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const REQUIRED_PHRASE = 'CLEAN REPLICA';
  const isConfirmationValid = confirmationText === REQUIRED_PHRASE;

  // Don't render if not admin
  if (adminCheckLoading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  const handleWipe = async () => {
    if (!isConfirmationValid) return;

    try {
      await wipeMutation.mutateAsync();
      setConfirmationText('');
      setShowVerification(true);
      // Trigger verification check after successful wipe
      setTimeout(() => {
        refetchVerification();
      }, 500);
    } catch (error) {
      console.error('Wipe failed:', error);
    }
  };

  const handleVerify = () => {
    setShowVerification(true);
    refetchVerification();
  };

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Admin: Clean Local Replica State
        </CardTitle>
        <CardDescription>
          Permanently delete all data from the local replica. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This will wipe all servers, profiles, messages, sessions, and audit logs from the local replica.
            The canister will be reset to an empty initial state.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="confirmation-text">
              Type <span className="font-mono font-bold">{REQUIRED_PHRASE}</span> to confirm
            </Label>
            <Input
              id="confirmation-text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={REQUIRED_PHRASE}
              disabled={wipeMutation.isPending}
              className="font-mono"
            />
          </div>

          <Button
            variant="destructive"
            onClick={handleWipe}
            disabled={!isConfirmationValid || wipeMutation.isPending}
            className="w-full"
          >
            {wipeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wiping Replica Data...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Clean Replica Data
              </>
            )}
          </Button>
        </div>

        {wipeMutation.isSuccess && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Success</AlertTitle>
            <AlertDescription className="text-green-600">
              Replica data has been wiped successfully. All cached queries have been cleared.
            </AlertDescription>
          </Alert>
        )}

        {wipeMutation.isError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {wipeMutation.error?.message || 'Failed to wipe replica data'}
            </AlertDescription>
          </Alert>
        )}

        {showVerification && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Verification Results</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerify}
                disabled={verificationFetching}
              >
                {verificationFetching ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {verificationData && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Servers:</span>
                  <span className="font-mono font-semibold">{Number(verificationData.serverCount)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Profiles:</span>
                  <span className="font-mono font-semibold">{Number(verificationData.userProfileCount)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Sessions:</span>
                  <span className="font-mono font-semibold">{Number(verificationData.sessionCount)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Audit Logs:</span>
                  <span className="font-mono font-semibold">{Number(verificationData.auditLogCount)}</span>
                </div>
              </div>
            )}

            {verificationData && 
              Number(verificationData.serverCount) === 0 && 
              Number(verificationData.userProfileCount) === 0 && 
              Number(verificationData.sessionCount) === 0 && 
              Number(verificationData.auditLogCount) === 0 && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Verified Clean</AlertTitle>
                <AlertDescription className="text-green-600">
                  All counts are zero. The replica is in a clean initial state.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
