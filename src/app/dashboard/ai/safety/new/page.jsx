import { CONFIG } from 'src/config-global';

import { HealthlineEntityCreateView } from 'src/sections/healthline';

export const metadata = { title: `Create AI Safety | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineEntityCreateView entityKey="ai-safety" />;
}
