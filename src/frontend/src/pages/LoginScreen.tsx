import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getErrorFlow } from '../auth/authMessages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Feature flag: Sign In is now available
const SIGN_IN_AVAILABLE = true;

export default function LoginScreen() {
  const { login, register, error: authError } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup');

  // Sign In form state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up form state
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  
  // Local validation errors (client-side only)
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSignInLoading(true);

    try {
      await login(signInIdentifier, signInPassword);
      // Success - AuthProvider will handle state transition to authenticated
    } catch (err: any) {
      // Error is already set in AuthProvider context
      // No need to set local error - it will be displayed via authError
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    if (!signUpUsername.trim()) {
      setValidationError('Username is required');
      return;
    }
    if (!signUpEmail.trim()) {
      setValidationError('Email is required');
      return;
    }
    if (!signUpPassword) {
      setValidationError('Password is required');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (signUpPassword.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    setSignUpLoading(true);

    try {
      await register(signUpUsername, signUpEmail, signUpPassword);
      // Success - AuthProvider will handle state transition to authenticated
    } catch (err: any) {
      // Error is already set in AuthProvider context
      // No need to set local error - it will be displayed via authError
    } finally {
      setSignUpLoading(false);
    }
  };

  // Determine which error to show based on active tab and error flow
  const errorFlow = authError ? getErrorFlow(authError) : null;
  const showSignInError = authError && (errorFlow === 'signin' || errorFlow === 'connection' || errorFlow === 'session');
  const showSignUpError = authError && (errorFlow === 'signup' || errorFlow === 'connection');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Title */}
          <div className="text-center space-y-2">
            <img 
              src="/assets/generated/app-logo.dim_512x128.png" 
              alt="App Logo" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
            <p className="text-muted-foreground">Sign in to your account or create a new one</p>
          </div>

          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">Account</CardTitle>
              <CardDescription className="text-center">
                Choose an option below to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin" disabled={!SIGN_IN_AVAILABLE}>
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="signin" className="space-y-4 mt-4">
                  {!SIGN_IN_AVAILABLE ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Sign In is temporarily unavailable. Please use Sign Up to create a new account.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSignIn} className="space-y-4">
                      {/* Show auth error only if it's relevant to sign-in flow */}
                      {showSignInError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="signin-identifier">Email or Username</Label>
                        <Input
                          id="signin-identifier"
                          type="text"
                          placeholder="Enter your email or username"
                          value={signInIdentifier}
                          onChange={(e) => setSignInIdentifier(e.target.value)}
                          disabled={signInLoading || !SIGN_IN_AVAILABLE}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          disabled={signInLoading || !SIGN_IN_AVAILABLE}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={signInLoading || !SIGN_IN_AVAILABLE}
                      >
                        {signInLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  )}
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Show validation errors (client-side) */}
                    {validationError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{validationError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Show auth error only if it's relevant to sign-up flow */}
                    {showSignUpError && !validationError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{authError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose a username"
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value)}
                        disabled={signUpLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        disabled={signUpLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 8 characters)"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        disabled={signUpLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        disabled={signUpLoading}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={signUpLoading}
                    >
                      {signUpLoading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
