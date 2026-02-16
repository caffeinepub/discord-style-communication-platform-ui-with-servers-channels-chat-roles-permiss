import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

export default function LoginScreen() {
  const { login, register, authStatus, error: authError } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign in form state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Sign up form state
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setIsSigningIn(true);

    try {
      await login(signInIdentifier, signInPassword);
      // On success, authStatus will change to 'authenticated' and App.tsx will handle the transition
    } catch (err: any) {
      setSignInError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    // Validate passwords match
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (signUpPassword.length < 8) {
      setSignUpError('Password must be at least 8 characters long');
      return;
    }

    // Validate username
    if (signUpUsername.length < 3) {
      setSignUpError('Username must be at least 3 characters long');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpEmail)) {
      setSignUpError('Please enter a valid email address');
      return;
    }

    setIsSigningUp(true);

    try {
      await register(signUpUsername, signUpEmail, signUpPassword);
      // On success, authStatus will change to 'authenticated' and App.tsx will handle the transition
    } catch (err: any) {
      setSignUpError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const currentError = authError || (activeTab === 'signin' ? signInError : signUpError);

  return (
    <AuthLayout
      title={activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
      description={activeTab === 'signin' ? 'Sign in to continue to your workspace' : 'Join us and start collaborating'}
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Create Account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4 mt-6">
          {currentError && activeTab === 'signin' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-identifier">Username or Email</Label>
              <Input
                id="signin-identifier"
                type="text"
                value={signInIdentifier}
                onChange={(e) => setSignInIdentifier(e.target.value)}
                placeholder="Enter your username or email"
                required
                autoComplete="username"
                disabled={isSigningIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isSigningIn}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSigningIn || !signInIdentifier || !signInPassword}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4 mt-6">
          {currentError && activeTab === 'signup' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-username">Username</Label>
              <Input
                id="signup-username"
                type="text"
                value={signUpUsername}
                onChange={(e) => setSignUpUsername(e.target.value)}
                placeholder="Choose a username"
                required
                autoComplete="username"
                disabled={isSigningUp}
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                disabled={isSigningUp}
              />
              <p className="text-xs text-muted-foreground">
                Your email will only be visible in account settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Create a password (min 8 characters)"
                required
                autoComplete="new-password"
                disabled={isSigningUp}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Confirm Password</Label>
              <Input
                id="signup-confirm-password"
                type="password"
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                disabled={isSigningUp}
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSigningUp || !signUpUsername || !signUpEmail || !signUpPassword || !signUpConfirmPassword}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground mt-6">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </AuthLayout>
  );
}
