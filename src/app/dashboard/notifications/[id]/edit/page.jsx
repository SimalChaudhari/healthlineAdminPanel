import { CONFIG } from 'src/config-global';

import { HealthlineNotificationEditView } from 'src/sections/healthline';

export const metadata = { title: `Edit notification | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineNotificationEditView id={params.id} />;
}
