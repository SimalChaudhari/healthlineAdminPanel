import { CONFIG } from 'src/config-global';

import { HealthlineFoodCreateView } from 'src/sections/healthline/view/healthline-food-create-view';

export const metadata = { title: `Create food | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineFoodCreateView />;
}
