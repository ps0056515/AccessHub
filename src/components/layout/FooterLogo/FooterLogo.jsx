import { useTheme } from 'context/ThemeContext';
import { useConfig } from 'context/ConfigContext';

export default function FooterLogo({ className, width = 200, height = 60, ...props }) {
  const { siteName, footerLogoUrl, darkFooterLogoUrl } = useConfig();
  const { theme } = useTheme();

  return (
    <img
      src={theme === 'dark' && darkFooterLogoUrl ? darkFooterLogoUrl : (footerLogoUrl || '/allcanaccess_footer.png')}
      alt={siteName || "AllCanAccess"}
      className={className}
      width={width}
      height={height}
      {...props}
    />
  );
}
