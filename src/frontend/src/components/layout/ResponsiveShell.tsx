import { useEffect, useState } from 'react';
import DesktopShell from './DesktopShell';
import MobileShell from './MobileShell';

export default function ResponsiveShell() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <MobileShell /> : <DesktopShell />;
}
