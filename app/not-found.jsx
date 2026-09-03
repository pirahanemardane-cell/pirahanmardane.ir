'use client';

export default function NotFound() {
  return (
    <div className="not-found-page min-h-[100svh] flex flex-col items-center justify-center px-4 py-12 bg-[#f5f5f7] text-[#252525] dark:bg-[#0a0a0a] dark:text-[#EBFFFB]">
      <div className="w-full max-w-lg text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#252525]/12 dark:border-white/15 bg-white dark:bg-[#1a1c20] text-xs font-medium text-[#414141] dark:text-[#7EFAFF] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] dark:bg-[#13ABC4]" />
          خطا · صفحه موجود نیست
        </div>

        {/* Big 404 */}
        <p
          className="font-black leading-none select-none mb-4"
          style={{
            fontSize: 'clamp(5rem, 18vw, 8.5rem)',
            letterSpacing: '-0.04em',
            background: 'linear-gradient(180deg, #FF0000 0%, #AF0404 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
          data-dark-404
        >
          ۴۰۴
        </p>
        <style dangerouslySetInnerHTML={{
          __html: `
            html.dark [data-dark-404] {
              background: linear-gradient(180deg, #7EFAFF 0%, #13ABC4 55%, #3161A3 100%) !important;
              -webkit-background-clip: text !important;
              background-clip: text !important;
              color: transparent !important;
            }
          `,
        }} />

        <h1 className="text-xl sm:text-2xl font-bold text-[#252525] dark:text-[#EBFFFB] mb-2">
          صفحه پیدا نشد
        </h1>
        <p className="text-sm sm:text-[0.9375rem] text-[#414141] dark:text-white/65 leading-relaxed max-w-sm mx-auto mb-8">
          آدرس واردشده اشتباه است یا این صفحه حذف شده. می‌توانید به خانه برگردید یا در فروشگاه جستجو کنید.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#FF0000] hover:bg-[#AF0404] dark:bg-[#13ABC4] dark:hover:bg-[#3161A3] transition shadow-md"
          >
            بازگشت به خانه
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-[#252525]/15 dark:border-white/25 bg-white dark:bg-[#1a1c20] text-[#252525] dark:text-[#EBFFFB] hover:border-[#FF0000] dark:hover:border-[#7EFAFF] transition"
          >
            مشاهده فروشگاه
          </a>
        </div>

        {/* Helper links */}
        <div className="mt-10 pt-6 border-t border-[#252525]/10 dark:border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#414141] dark:text-white/50">
          <a href="/?page=deals" className="hover:text-[#FF0000] dark:hover:text-[#7EFAFF] transition">شگفت‌انگیز</a>
          <span className="opacity-30">|</span>
          <a href="/?page=contact" className="hover:text-[#FF0000] dark:hover:text-[#7EFAFF] transition">تماس با ما</a>
          <span className="opacity-30">|</span>
          <a href="/?page=faq" className="hover:text-[#FF0000] dark:hover:text-[#7EFAFF] transition">سوالات متداول</a>
        </div>
      </div>
    </div>
  );
}
