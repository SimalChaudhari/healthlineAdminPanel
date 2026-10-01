import { CONFIG } from 'src/config-global';

import { HealthlineSecurityView } from 'src/sections/healthline';

export const metadata = { title: `Security | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineSecurityView />;
}
