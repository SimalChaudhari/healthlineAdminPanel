import { CONFIG } from 'src/config-global';

import { HealthlineRecipeCreateView } from 'src/sections/healthline';

export const metadata = { title: `Create recipe | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineRecipeCreateView />;
}
