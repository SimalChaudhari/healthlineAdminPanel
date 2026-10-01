import { CONFIG } from 'src/config-global';

import { HealthlineFoodsView } from 'src/sections/healthline';

export const metadata = { title: `Food Database | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineFoodsView />;
}
