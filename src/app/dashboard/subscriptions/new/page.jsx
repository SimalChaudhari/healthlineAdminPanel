import { CONFIG } from 'src/config-global';

import { HealthlinePlanCreateView } from 'src/sections/healthline/view/healthline-plan-create-view';

export const metadata = { title: `Create plan | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlinePlanCreateView />;
}
