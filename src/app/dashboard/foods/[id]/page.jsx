import { CONFIG } from 'src/config-global';

import { HealthlineFoodDetailsView } from 'src/sections/healthline/view/healthline-food-details-view';

export const metadata = { title: `Food details | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <HealthlineFoodDetailsView id={params.id} />;
}
