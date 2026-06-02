import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsApi } from 'api/client';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [siteName, setSiteName] = useState('AllCanAccess');
  const [navbarLogoUrl, setNavbarLogoUrl] = useState('/allcanaccess.png');
  const [footerLogoUrl, setFooterLogoUrl] = useState('/allcanaccess_footer.png');
  const [navigation, setNavigation] = useState({
    navbar: [],
    footer_community: [],
    footer_standards: [],
    footer_org: [],
    footer_socials: []
  });
  const [footerColumns, setFooterColumns] = useState([]);
  
  // Portal Hero config
  const [portalConfig, setPortalConfig] = useState({
    bgUrl: '',
    badge: 'Live community · weekly office hours',
    heading: 'Where accessibility\npractitioners connect',
    subheading: 'Crowd-sourced discussions, vetted guides, tooling, and events — built with practitioners who ship inclusive products in the real world.',
    tags: [
      { label: "WCAG 2.2 implementations", searchText: "WCAG 2.2 implementations" },
      { label: "Screen reader testing", searchText: "Screen reader testing" },
      { label: "Legal & procurement", searchText: "Legal & procurement" },
      { label: "Design systems", searchText: "Design systems" },
    ],
    stats: [
      { num: "3.2k", label: "Active members" },
      { num: "15k+", label: "Questions answered" },
      { num: "80+", label: "Vetted tools" },
      { num: "12", label: "Upcoming events" },
    ],
    askTopics: [
      "WCAG 2.2",
      "Screen readers",
      "Legal",
      "ARIA",
      "Color contrast",
      "Design systems",
      "Strategy",
      "Career advice",
      "Mobile",
      "PDFs",
      "Other",
    ],
    askPlaceholder: 'Ask the community a question...',
    searchPlaceholder: 'Search discussions, topics, or members...'
  });

  const [loading, setLoading] = useState(true);

  const refreshConfig = useCallback(async () => {
    try {
      const data = await settingsApi.get();
      if (data) {
        if (data.site_name) setSiteName(data.site_name);
        if (data.navbar_logo_url) setNavbarLogoUrl(data.navbar_logo_url);
        if (data.footer_logo_url) setFooterLogoUrl(data.footer_logo_url);
        if (data.navigation) setNavigation(data.navigation);
        if (data.footer_columns) setFooterColumns(data.footer_columns);
        
        setPortalConfig(prev => ({
          bgUrl: data.portal_hero_bg_url ?? prev.bgUrl,
          badge: data.portal_hero_badge || prev.badge,
          heading: data.portal_hero_heading || prev.heading,
          subheading: data.portal_hero_subheading || prev.subheading,
          tags: data.portal_hero_tags || prev.tags,
          stats: data.portal_stats || prev.stats,
          askPlaceholder: data.portal_ask_placeholder || 'Ask the community a question...',
          searchPlaceholder: data.portal_search_placeholder || 'Search discussions, topics, or members...',
          askTopics: data.portal_ask_topics || prev.askTopics,
        }));
      }
    } catch (err) {
      console.error('Failed to load system settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const value = {
    siteName,
    navbarLogoUrl,
    footerLogoUrl,
    navigation,
    footerColumns,
    portalConfig,
    loading,
    refreshConfig
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
}
