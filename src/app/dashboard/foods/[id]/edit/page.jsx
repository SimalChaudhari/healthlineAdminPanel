import { CONFIG } from 'src/config-global';

import { HealthlineFoodEditView } from 'src/sections/healthline/view/healthline-food-edit-view';

export const metadata = { title: `Edit food | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineFoodEditView id={params.id} />;
}
