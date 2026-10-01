/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['mui-one-time-password-input'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async redirects() {
    // Admin-only app: no public user-panel / marketing / shop routes
    return [
      { source: '/', destination: '/dashboard', permanent: false },
      // Not app routes: an app/404 or app/500 page breaks `next build` (ENOENT renaming 500.html).
      { source: '/404', destination: '/error/404', permanent: false },
      { source: '/500', destination: '/error/500', permanent: false },
      { source: '/about-us', destination: '/dashboard', permanent: false },
      { source: '/contact-us', destination: '/dashboard', permanent: false },
      { source: '/faqs', destination: '/dashboard', permanent: false },
      { source: '/blank', destination: '/dashboard', permanent: false },
      { source: '/product', destination: '/dashboard', permanent: false },
      { source: '/product/:path*', destination: '/dashboard', permanent: false },
      { source: '/post', destination: '/dashboard', permanent: false },
      { source: '/post/:path*', destination: '/dashboard', permanent: false },
      { source: '/components', destination: '/dashboard', permanent: false },
      { source: '/components/:path*', destination: '/dashboard', permanent: false },
      { source: '/payment', destination: '/dashboard', permanent: false },
      { source: '/pricing', destination: '/dashboard', permanent: false },
      { source: '/coming-soon', destination: '/dashboard', permanent: false },
      { source: '/auth-demo', destination: '/auth/sign-in', permanent: false },
      { source: '/auth-demo/:path*', destination: '/auth/sign-in', permanent: false },
      { source: '/auth/sign-up', destination: '/auth/sign-in', permanent: false },
      { source: '/auth/jwt', destination: '/auth/sign-in', permanent: false },
      { source: '/auth/jwt/:path*', destination: '/auth/sign-in', permanent: false },
      { source: '/auth/amplify/:path*', destination: '/auth/sign-in', permanent: false },
      { source: '/auth/firebase/:path*', destination: '/auth/sign-in', permanent: false },
      { source: '/auth/supabase/:path*', destination: '/auth/sign-in', permanent: false },
      { source: '/auth/auth0/:path*', destination: '/auth/sign-in', permanent: false },
    ];
  },
  async rewrites() {
    const templateApi =
      process.env.NEXT_PUBLIC_TEMPLATE_API_URL || 'https://api-dev-minimal-v610.vercel.app';

    return [
      {
        // Local Next APIs are excluded so they are never proxied to the template API.
        // Dynamic routes (e.g. /api/diary/[date]) resolve AFTER this rewrite — add every new
        // local API prefix here or its [param] routes will 404 on the template server.
        source:
          '/api/((?!auth(?:/|$)|users(?:/|$)|upload(?:/|$)|plans(?:/|$)|features(?:/|$)|foods(?:/|$)|recipes(?:/|$)|diary(?:/|$)|streak(?:/|$)|favorites(?:/|$)|dashboard(?:/|$)|notifications(?:/|$)|reminders(?:/|$)|push-token(?:/|$)).*)',
        destination: `${templateApi}/api/$1`,
      },
    ];
  },
};

export default nextConfig;
