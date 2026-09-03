'use client';

import { Component } from 'react';

/** Catches client errors in a section so the whole app doesn't white-screen. */
export default class ClientErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error && error.message ? String(error.message) : 'خطای ناشناخته',
    };
  }

  componentDidCatch(error) {
    try {
      console.error('[ClientErrorBoundary]', error);
    } catch (_) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center" dir="rtl">
          <p className="text-base font-bold text-primary-900 dark:text-white mb-2">
            بارگذاری این بخش با خطا روبه‌رو شد
          </p>
          <p className="text-xs text-red-500 mb-4 font-mono break-all" dir="ltr">
            {this.state.message}
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-primary-800 text-white text-sm"
            onClick={() => {
              this.setState({ hasError: false, message: '' });
              try {
                window.location.reload();
              } catch (_) {}
            }}
          >
            تلاش مجدد
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
