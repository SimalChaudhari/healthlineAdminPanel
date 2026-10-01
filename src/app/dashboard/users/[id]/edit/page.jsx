import { CONFIG } from 'src/config-global';

import { HealthlineUserEditView } from 'src/sections/healthline/view/healthline-user-edit-view';

export const metadata = { title: `Edit user | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineUserEditView id={params.id} />;
}
