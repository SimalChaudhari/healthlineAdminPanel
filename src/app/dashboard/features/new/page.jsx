import { CONFIG } from 'src/config-global';

import { HealthlineFeatureCreateView } from 'src/sections/healthline/view/healthline-feature-create-view';

export const metadata = { title: `Create feature | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineFeatureCreateView />;
}
