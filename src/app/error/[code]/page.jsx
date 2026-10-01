import { CONFIG } from 'src/config-global';

import { View403, View500, NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

const ERROR_PAGES = {
  '403': {
    title: `403 forbidden! | Error - ${CONFIG.site.name}`,
    View: View403,
  },
  '404': {
    title: `404 page not found! | Error - ${CONFIG.site.name}`,
    View: NotFoundView,
  },
  '500': {
    title: `500 Internal server error! | Error - ${CONFIG.site.name}`,
    View: View500,
  },
};

export function generateMetadata({ params }) {
  const page = ERROR_PAGES[params.code];

  return {
    title: page?.title || `${params.code} | Error - ${CONFIG.site.name}`,
  };
}

export default function Page({ params }) {
  const page = ERROR_PAGES[params.code];

  if (!page) {
    return <NotFoundView />;
  }

  const { View } = page;

  return <View />;
}
