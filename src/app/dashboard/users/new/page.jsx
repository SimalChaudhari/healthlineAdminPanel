import { CONFIG } from 'src/config-global';

import { HealthlineUserCreateView } from 'src/sections/healthline/view/healthline-user-create-view';

export const metadata = { title: `Create user | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineUserCreateView />;
}
