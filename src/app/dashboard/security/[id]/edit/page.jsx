import { CONFIG } from 'src/config-global';

import { HealthlineEntityEditView } from 'src/sections/healthline';

export const metadata = { title: `Edit Security | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineEntityEditView entityKey="security" id={params.id} />;
}
