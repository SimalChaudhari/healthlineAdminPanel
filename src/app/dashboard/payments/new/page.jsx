import { CONFIG } from 'src/config-global';

import { HealthlineEntityCreateView } from 'src/sections/healthline';

export const metadata = { title: `Create Payments | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineEntityCreateView entityKey="payments" />;
}
