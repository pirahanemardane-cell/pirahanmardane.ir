'use client'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-red-600 mb-2">خطایی رخ داد</p>
      <h1 className="text-xl font-bold mb-3">مشکلی در نمایش این صفحه پیش آمد</h1>
      <p className="text-sm text-zinc-500 mb-6 max-w-md">{error?.message ? 'لطفاً دوباره تلاش کنید.' : 'لطفاً دوباره تلاش کنید.'}</p>
      <button
        type="button"
        onClick={() => (typeof reset === 'function' ? reset() : (window.location.href = '/'))}
        className="px-5 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-bold"
      >
        تلاش مجدد
      </button>
    </div>
  )
}
