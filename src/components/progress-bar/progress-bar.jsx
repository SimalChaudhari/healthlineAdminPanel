'use client';

import './styles.css';

import NProgress from 'nprogress';
import { Suspense, useEffect } from 'react';

import { usePathname } from 'src/routes/hooks/use-pathname';
import { useSearchParams } from 'src/routes/hooks/use-search-params';

// ----------------------------------------------------------------------

NProgress.configure({ showSpinner: false });

function isSameUrl(targetUrl) {
  try {
    const next = new URL(targetUrl, window.location.origin);
    const current = new URL(window.location.href);
    return `${next.pathname}${next.search}` === `${current.pathname}${current.search}`;
  } catch {
    return false;
  }
}

function isInternalLink(anchor) {
  if (!anchor) return false;

  const href = anchor.getAttribute('href');
  const target = anchor.getAttribute('target');
  const download = anchor.hasAttribute('download');

  if (!href || download || target === '_blank') {
    return false;
  }

  if (href.startsWith('#')) {
    return false;
  }

  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  if (href.startsWith('http') || href.startsWith('//')) {
    try {
      return new URL(href, window.location.origin).origin === window.location.origin;
    } catch {
      return false;
    }
  }

  return href.startsWith('/');
}

function startProgress(targetUrl) {
  if (targetUrl && isSameUrl(targetUrl)) {
    return;
  }

  NProgress.start();
}

export function startNavigationProgress(href) {
  startProgress(href);
}

export function stopNavigationProgress() {
  NProgress.done();
}

export function ProgressBar() {
  useEffect(() => {
    const handleClick = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = event.target?.closest?.('a');

      if (!isInternalLink(anchor)) {
        return;
      }

      startProgress(anchor.href);
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <NProgressDone />
    </Suspense>
  );
}

function NProgressDone() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
