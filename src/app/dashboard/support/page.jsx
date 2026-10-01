import { CONFIG } from 'src/config-global';

import { HealthlineSupportView } from 'src/sections/healthline';

export const metadata = { title: `Support | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineSupportView />;
}
