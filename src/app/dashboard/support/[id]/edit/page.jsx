import { CONFIG } from 'src/config-global';

import { HealthlineEntityEditView } from 'src/sections/healthline';

export const metadata = { title: `Edit Support | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineEntityEditView entityKey="support" id={params.id} />;
}
