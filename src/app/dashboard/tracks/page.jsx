import { CONFIG } from 'src/config-global';

import { HealthlineTracksView } from 'src/sections/healthline';

export const metadata = { title: `Health Tracks | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineTracksView />;
}
