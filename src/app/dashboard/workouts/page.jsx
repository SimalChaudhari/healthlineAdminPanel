import { CONFIG } from 'src/config-global';

import { HealthlineWorkoutsView } from 'src/sections/healthline';

export const metadata = { title: `Workout Programs | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <HealthlineWorkoutsView />;
}
