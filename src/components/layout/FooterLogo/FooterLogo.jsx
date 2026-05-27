import { useConfig } from 'context/ConfigContext';

export default function FooterLogo({ className, width = 200, height = 60 }) {
  const { siteName, footerLogoUrl } = useConfig();

  return (
    <img
      src={footerLogoUrl || '/allcanaccess_footer.png'}
      alt={`${siteName} logo`}
      className={className}
      width={width}
      height={height}
    />
  );
}
