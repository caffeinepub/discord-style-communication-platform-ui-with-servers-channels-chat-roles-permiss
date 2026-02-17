import React, { useState } from 'react';
import { useAuthContext } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { categorizeErrorFlow } from '../auth/authMessages';

export default function LoginScreen() {
  const { login, register, error: authError } = useAuthContext();
  
  // Sign In form state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  
  // Sign Up form state
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    
    // Client-side validation
    if (!signInIdentifier.trim() || !signInPassword.trim()) {
      setSignInError('Please enter both email/username and password.');
      return;
    }
    
    setSignInLoading(true);
    try {
      await login(signInIdentifier, signInPassword);
      // Success - auth context will update and App will show main content
    } catch (err: any) {
      // Error is already set in auth context, but we also set it locally for immediate feedback
      setSignInError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    
    // Client-side validation
    if (!signUpUsername.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setSignUpError('Please fill in all fields.');
      return;
    }
    
    if (!signUpEmail.includes('@')) {
      setSignUpError('Please enter a valid email address.');
      return;
    }
    
    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters long.');
      return;
    }
    
    setSignUpLoading(true);
    try {
      await register(signUpUsername, signUpEmail, signUpPassword);
      // Success - auth context will update and App will show main content
    } catch (err: any) {
      // Error is already set in auth context, but we also set it locally for immediate feedback
      setSignUpError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSignUpLoading(false);
    }
  };

  // Determine which error to show on which tab
  // Auth errors from context should be displayed on the appropriate tab
  const signInDisplayError = activeTab === 'signin' ? (signInError || (authError && categorizeErrorFlow(authError) === 'signin' ? authError : null)) : null;
  const signUpDisplayError = activeTab === 'signup' ? (signUpError || (authError && (categorizeErrorFlow(authError) === 'signup' || categorizeErrorFlow(authError) === 'signin') ? authError : null)) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/assets/generated/app-logo.dim_512x128.png" 
            alt="App Logo" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">Welcome</h1>
          <p className="text-muted-foreground">Sign in or create an account to continue</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            {signInDisplayError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{signInDisplayError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-identifier">Email or Username</Label>
                <Input
                  id="signin-identifier"
                  type="text"
                  placeholder="Enter your email or username"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  disabled={signInLoading}
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
                  disabled={signInLoading}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={signInLoading}
              >
                {signInLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            {signUpDisplayError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{signUpDisplayError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSignUp} className="space-y-4">
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
                  placeholder="Create a password (min 6 characters)"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  disabled={signUpLoading}
                  required
                  minLength={6}
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

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} · Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
