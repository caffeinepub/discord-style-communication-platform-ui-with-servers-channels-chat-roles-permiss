import { createContext, useContext, useState, ReactNode, createElement } from 'react';

type ViewType = 'home' | 'server' | 'discovery' | 'settings';
type HomeTab = 'dms' | 'friends';
type ChannelType = 'text' | 'voice' | 'stage';

interface NavigationState {
  currentView: ViewType;
  selectedServerId: string | null;
  selectedChannelId: string | null;
  selectedChannelType: ChannelType | null;
  homeTab: HomeTab;
  expandedCategories: Record<string, boolean>;
  showServerSettings: boolean;
  showUserSettings: boolean;
  selectedMemberId: string | null;
}

interface NavigationContextType extends NavigationState {
  setCurrentView: (view: ViewType) => void;
  selectServer: (serverId: string | null) => void;
  selectChannel: (channelId: string | null, type: ChannelType | null) => void;
  setHomeTab: (tab: HomeTab) => void;
  toggleCategory: (categoryId: string) => void;
  setShowServerSettings: (show: boolean) => void;
  setShowUserSettings: (show: boolean) => void;
  setSelectedMemberId: (memberId: string | null) => void;
  goHome: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    currentView: 'home',
    selectedServerId: null,
    selectedChannelId: null,
    selectedChannelType: null,
    homeTab: 'friends',
    expandedCategories: {},
    showServerSettings: false,
    showUserSettings: false,
    selectedMemberId: null,
  });

  const setCurrentView = (view: ViewType) => {
    setState((prev) => ({ ...prev, currentView: view, showServerSettings: false, showUserSettings: false }));
  };

  const selectServer = (serverId: string | null) => {
    setState((prev) => ({
      ...prev,
      currentView: 'server',
      selectedServerId: serverId,
      selectedChannelId: null,
      selectedChannelType: null,
      showServerSettings: false,
      showUserSettings: false,
    }));
  };

  const selectChannel = (channelId: string | null, type: ChannelType | null) => {
    setState((prev) => ({
      ...prev,
      selectedChannelId: channelId,
      selectedChannelType: type,
    }));
  };

  const setHomeTab = (tab: HomeTab) => {
    setState((prev) => ({ ...prev, homeTab: tab }));
  };

  const toggleCategory = (categoryId: string) => {
    setState((prev) => ({
      ...prev,
      expandedCategories: {
        ...prev.expandedCategories,
        [categoryId]: !prev.expandedCategories[categoryId],
      },
    }));
  };

  const setShowServerSettings = (show: boolean) => {
    setState((prev) => ({ ...prev, showServerSettings: show, showUserSettings: false }));
  };

  const setShowUserSettings = (show: boolean) => {
    setState((prev) => ({ ...prev, showUserSettings: show, showServerSettings: false }));
  };

  const setSelectedMemberId = (memberId: string | null) => {
    setState((prev) => ({ ...prev, selectedMemberId: memberId }));
  };

  const goHome = () => {
    setState((prev) => ({
      ...prev,
      currentView: 'home',
      selectedServerId: null,
      selectedChannelId: null,
      selectedChannelType: null,
      showServerSettings: false,
      showUserSettings: false,
    }));
  };

  return createElement(
    NavigationContext.Provider,
    {
      value: {
        ...state,
        setCurrentView,
        selectServer,
        selectChannel,
        setHomeTab,
        toggleCategory,
        setShowServerSettings,
        setShowUserSettings,
        setSelectedMemberId,
        goHome,
      },
    },
    children
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
