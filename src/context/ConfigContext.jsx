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
