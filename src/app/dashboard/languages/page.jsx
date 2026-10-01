import { CONFIG } from 'src/config-global';

import { HealthlineLanguagesView } from 'src/sections/healthline';

export const metadata = { title: `Languages | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineLanguagesView />;
}
