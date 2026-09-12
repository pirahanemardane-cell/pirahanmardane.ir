use client'

import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: String(error?.message || error || 'خطای ناشناخته') }
  }

  componentDidCatch(error, info) {
    try {
      console.error('[ErrorBoundary]', error, info?.componentStack)
    } catch (_) {}
    try {
      fetch('/api/admin/errors', { method: 'GET', credentials: 'include' }).catch(() => {})
      // best-effort client ping — real log via dedicated endpoint if exists
      if (typeof window !== 'undefined') {
        const payload = {
          source: 'ErrorBoundary',
          message: String(error?.message || error || '').slice(0, 500),
          stack: String(info?.componentStack || '').slice(0, 1500),
          href: String(window.location?.href || '').slice(0, 300),
          at: new Date().toISOString(),
        }
        navigator.sendBeacon?.(
          '/api/client-error',
          new Blob([JSON.stringify(payload)], { type: 'application/json' }),
        )
        fetch('/api/client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
          keepalive: true,
        }).catch(() => {})
      }
    } catch (_) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 480, margin: '40px auto' }}>
          <h1 style={{ fontSize: 18, marginBottom: 8 }}>خطایی در نمایش صفحه رخ داد</h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
            لطفاً صفحه را تازه کنید. اگر تکرار شد، از پشتیبانی بگویید.
          </p>
          <button
            type="button"
            onClick={() => {
              try { this.setState({ hasError: false, message: '' }) } catch (_) {}
              try { window.location.reload() } catch (_) {}
            }}
            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            تلاش دوباره
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
