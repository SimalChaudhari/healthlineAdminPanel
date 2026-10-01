import { CONFIG } from 'src/config-global';

import { HealthlineSettingsView } from 'src/sections/healthline';

export const metadata = { title: `Settings | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineSettingsView />;
}
