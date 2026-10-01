import { CONFIG } from 'src/config-global';

import { HealthlineUsersView } from 'src/sections/healthline';

export const metadata = { title: `Users | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineUsersView />;
}
