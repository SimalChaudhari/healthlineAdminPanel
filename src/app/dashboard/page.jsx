import { CONFIG } from 'src/config-global';

import { HealthlineDashboardView } from 'src/sections/healthline';

export const metadata = { title: `Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineDashboardView />;
}
