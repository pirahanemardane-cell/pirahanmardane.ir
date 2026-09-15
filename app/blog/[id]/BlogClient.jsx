'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../../../components/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-white/60 text-2xl tracking-wide">در حال بارگذاری مطلب…</div>
    </div>
  ),
});

export default function BlogClient({ id }) {
  return <App initialBlogId={id || null} />;
}
