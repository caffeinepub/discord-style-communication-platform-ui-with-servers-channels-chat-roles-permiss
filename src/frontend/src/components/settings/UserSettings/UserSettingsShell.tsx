import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, LogOut } from 'lucide-react';
import { useNavigation } from '../../../state/navigation';
import ProfilePage from './pages/ProfilePage';
import AppearancePage from './pages/AppearancePage';
import { cn } from '@/lib/utils';
import { useLogout } from '../../../hooks/useLogout';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../../../auth/useAuth';

type SettingsPage = 'profile' | 'appearance';

export default function UserSettingsShell() {
  const [currentPage, setCurrentPage] = useState<SettingsPage>('profile');
  const { setShowUserSettings } = useNavigation();
  const { logout } = useLogout();
  const { authStatus } = useAuth();

  const pages = [
    { id: 'profile', label: 'My Profile' },
    { id: 'appearance', label: 'Appearance' },
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserSettings(false);
  };

  // Handle case where user is not authenticated (shouldn't normally happen, but defensive)
  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <div className="flex h-full bg-background">
      <div className="w-60 bg-[oklch(0.21_0.01_250)] border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">User Settings</h2>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-2 space-y-1">
            {pages.map((page) => (
              <Button
                key={page.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  currentPage === page.id && 'bg-accent text-accent-foreground'
                )}
                onClick={() => setCurrentPage(page.id as SettingsPage)}
              >
                {page.label}
              </Button>
            ))}
            
            <Separator className="my-2" />
            
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex h-12 items-center justify-between px-6 border-b border-border">
          <h3 className="font-semibold">{pages.find((p) => p.id === currentPage)?.label}</h3>
          <Button variant="ghost" size="icon" onClick={() => setShowUserSettings(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {currentPage === 'profile' && <ProfilePage />}
            {currentPage === 'appearance' && <AppearancePage />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
