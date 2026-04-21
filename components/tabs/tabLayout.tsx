'use client';

import { useTabStore } from '@/stores/tabstore';
import { useTabSync } from '@/hooks/useTabsync';
import { TabBar } from './TabBar';
import { TabContent } from './tabContent';
import { parseTabFromUrl } from '@/hooks/useTabNavigation';
import { usePathname } from 'next/navigation';

interface TabLayoutProps {
  children: React.ReactNode;
}

/**
 * Orchestration component that wraps the main content area.
 * Renders the tab bar + tab content when tabs are open,
 * or falls through to {children} (normal route rendering) when no tabs exist.
 */
export function TabLayout({ children }: TabLayoutProps) {
  useTabSync();

  const tabs = useTabStore((s) => s.tabs);
  const pathname = usePathname();

  // Check if current URL is a tab-compatible route
  const isTabRoute = parseTabFromUrl(pathname) !== null;

  // Only show tab UI when we're on a tab-compatible route AND tabs exist.
  // When the user navigates to /home, /Ai — always show
  // the normal page content. Tabs persist in the store and reappear when
  // navigating back to a tab-compatible route.
  if (tabs.length > 0 && isTabRoute) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <TabBar />
        <TabContent />
      </div>
    );
  }

  // Normal page content (home, AI, etc.)
  return <>{children}</>;
}