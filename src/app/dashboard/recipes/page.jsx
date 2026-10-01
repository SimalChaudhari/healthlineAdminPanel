import { CONFIG } from 'src/config-global';

import { HealthlineRecipesView } from 'src/sections/healthline';

export const metadata = { title: `Recipes | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineRecipesView />;
}
