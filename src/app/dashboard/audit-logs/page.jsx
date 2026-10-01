import { CONFIG } from 'src/config-global';

import { HealthlineAuditView } from 'src/sections/healthline';

export const metadata = { title: `Audit Logs | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineAuditView />;
}
