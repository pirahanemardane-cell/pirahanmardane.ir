/** First-paint shell while the main App chunk downloads (matches hero poster). */
export default function PageBootShell({ label = 'در حال بارگذاری…' }) {
  return (
    <div
      className="min-h-[100svh] bg-[#5C6065] flex flex-col"
      style={{
        backgroundImage: 'url(/hero-poster.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="mt-auto mb-[18vh] flex justify-center px-4">
        <div className="px-4 py-2 rounded-full bg-black/40 text-white/75 text-sm tracking-wide backdrop-blur-sm">
          {label}
        </div>
      </div>
    </div>
  );
}
