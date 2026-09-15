'use client'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-red-600 mb-2">خطایی رخ داد</p>
      <h1 className="text-xl font-bold mb-3">مشکلی در نمایش این صفحه پیش آمد</h1>
      <p className="text-sm text-zinc-500 mb-6 max-w-md">{error?.message ? 'لطفاً دوباره تلاش کنید.' : 'لطفاً دوباره تلاش کنید.'}</p>
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
        <button
          type="button"
          onClick={() => (typeof reset === 'function' ? reset() : (window.location.href = '/'))}
          className="px-5 py-2.5 rounded-full bg-zinc-900 bg-[#13ABC4] text-white text-sm font-bold min-h-[44px]"
        >
          تلاش مجدد
        </button>
        <a href="/" className="px-5 py-2.5 rounded-full border border-zinc-300 border-white/25 text-sm font-medium min-h-[44px] inline-flex items-center">
          بازگشت به خانه
        </a>
      </div>
    </div>
  )
}
