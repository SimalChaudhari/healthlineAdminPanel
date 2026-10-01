import { CONFIG } from 'src/config-global';

import { HealthlineNotificationCreateView } from 'src/sections/healthline';

export const metadata = { title: `New notification | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineNotificationCreateView />;
}
