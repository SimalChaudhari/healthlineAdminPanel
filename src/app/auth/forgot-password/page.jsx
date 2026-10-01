import { CONFIG } from 'src/config-global';

import { ForgotPasswordView } from 'src/sections/auth/jwt';

export const metadata = { title: `Forgot password | ${CONFIG.site.name}` };

export default function Page() {
  return <ForgotPasswordView />;
}
