'use client';

import dynamic from 'next/dynamic';
import PageBootShell from '../components/PageBootShell';

/* App is fully client-side (localStorage, drawers, panels). Disable SSR to avoid hydration mismatches. */
const App = dynamic(() => import('../components/App'), {
  ssr: false,
  loading: () => <PageBootShell />,
});

export default function Page() {
  return <App />;
}
