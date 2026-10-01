import { CONFIG } from 'src/config-global';

import { HealthlineAiView } from 'src/sections/healthline';

export const metadata = { title: `AI | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineAiView />;
}
