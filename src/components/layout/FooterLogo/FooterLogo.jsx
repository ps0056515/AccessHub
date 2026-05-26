import { useState } from 'react';
import { SITE_NAME, footerLogoUrl, logoUrl } from 'brand';

export default function FooterLogo({ className, width = 200, height = 60 }) {
  const [src, setSrc] = useState(footerLogoUrl());

  return (
    <img
      src={src}
      alt={`${SITE_NAME} logo`}
      className={className}
      width={width}
      height={height}
      onError={() => {
        if (src !== logoUrl()) setSrc(logoUrl());
      }}
    />
  );
}
