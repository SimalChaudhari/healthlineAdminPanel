import { CONFIG } from 'src/config-global';

import { HealthlinePlanEditView } from 'src/sections/healthline/view/healthline-plan-edit-view';

export const metadata = { title: `Edit plan | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlinePlanEditView id={params.id} />;
}
