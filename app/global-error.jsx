'use client'

export default function GlobalError({ error, reset }) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ fontFamily: 'Tahoma, sans-serif', padding: 24, textAlign: 'center' }}>
        <h1>خطای غیرمنتظره</h1>
        <p>لطفاً صفحه را تازه کنید.</p>
        <button type="button" onClick={() => (typeof reset === 'function' ? reset() : (window.location.href = '/'))}>
          تلاش مجدد
        </button>
      </body>
    </html>
  )
}
