import { CONFIG } from 'src/config-global';

import { HealthlineFeatureEditView } from 'src/sections/healthline/view/healthline-feature-edit-view';

export const metadata = { title: `Edit feature | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineFeatureEditView id={params.id} />;
}
