import 'src/global.css';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { schemeConfig } from 'src/theme/color-scheme-script';

import { AppProviders } from './providers';

// ----------------------------------------------------------------------

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

export const metadata = {
  title: {
    default: CONFIG.site.name,
    template: `%s | ${CONFIG.site.name}`,
  },
  icons: {
    icon: [{ url: '/SLogo.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          defaultMode={schemeConfig.defaultMode}
          modeStorageKey={schemeConfig.modeStorageKey}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
