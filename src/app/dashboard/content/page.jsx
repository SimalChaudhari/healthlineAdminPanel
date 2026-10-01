import { CONFIG } from 'src/config-global';

import { HealthlineContentView } from 'src/sections/healthline';

export const metadata = { title: `Content | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineContentView />;
}
