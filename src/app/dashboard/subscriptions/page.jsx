import { CONFIG } from 'src/config-global';

import { HealthlineSubscriptionsView } from 'src/sections/healthline';

export const metadata = { title: `Subscriptions | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineSubscriptionsView />;
}
