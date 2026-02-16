import { useInternetIdentity } from './hooks/useInternetIdentity';
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

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
  };

  if (isInitializing) {
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
