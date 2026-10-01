import { CONFIG } from 'src/config-global';

import { HealthlineRecipeEditView } from 'src/sections/healthline';

export const metadata = { title: `Edit recipe | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineRecipeEditView id={params.id} />;
}
