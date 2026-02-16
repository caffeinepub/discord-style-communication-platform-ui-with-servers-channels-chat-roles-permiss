import { useAuth } from './auth/useAuth';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import LoginScreen from './pages/LoginScreen';
import ProfileSetupDialog from './components/profile/ProfileSetupDialog';
import ResponsiveShell from './components/layout/ResponsiveShell';
import { NavigationProvider } from './state/navigation';
import { SettingsProvider } from './state/settings';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import UserProfileOverlay from './components/profile/UserProfileOverlay';
import { setupXPathElementRemoval } from './utils/hideElementByXPath';
import { AuthProvider } from './auth/AuthProvider';

function AppContent() {
  const { authStatus } = useAuth();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  // Set up XPath-based element removal
  useEffect(() => {
    const cleanup = setupXPathElementRemoval('/html[1]/body[1]/div[5]/button[1]');
    return cleanup;
  }, []);

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
  };

  if (authStatus === 'initializing') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <SettingsProvider>
          <NavigationProvider>
            <div className="h-screen overflow-hidden">
              <ResponsiveShell />
            </div>
            <ProfileSetupDialog
              open={showProfileSetup}
              onComplete={handleProfileSetupComplete}
            />
            <UserProfileOverlay />
          </NavigationProvider>
        </SettingsProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
