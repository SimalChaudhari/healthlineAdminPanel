import { CONFIG } from 'src/config-global';

import { HealthlineNotificationsView } from 'src/sections/healthline';

export const metadata = { title: `Notifications | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineNotificationsView />;
}
