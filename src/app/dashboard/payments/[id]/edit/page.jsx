import { CONFIG } from 'src/config-global';

import { HealthlineEntityEditView } from 'src/sections/healthline';

export const metadata = { title: `Edit Payments | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineEntityEditView entityKey="payments" id={params.id} />;
}
