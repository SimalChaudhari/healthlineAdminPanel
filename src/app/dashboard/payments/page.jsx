import { CONFIG } from 'src/config-global';

import { HealthlinePaymentsView } from 'src/sections/healthline';

export const metadata = { title: `Payments | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlinePaymentsView />;
}
