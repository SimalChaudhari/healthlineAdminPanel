import { CONFIG } from 'src/config-global';

import { HealthlineReportsView } from 'src/sections/healthline';

export const metadata = { title: `Reports | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineReportsView />;
}
