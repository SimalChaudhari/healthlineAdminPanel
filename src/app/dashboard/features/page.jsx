import { CONFIG } from 'src/config-global';

import { HealthlineFeaturesView } from 'src/sections/healthline/view/healthline-features-view';

export const metadata = { title: `App Features | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineFeaturesView />;
}
