'use client';

import { HERO_COPY } from './hero.config';
import AntiMetalButton from '@/components/ui/anti-metal-button';

export default function HeroChrome({ hintRef, titleRef, body1Ref, onShopClick }) {
  const goShop = () => {
    if (typeof onShopClick === 'function') onShopClick();
    else if (typeof window !== 'undefined') window.location.href = '/فروشگاه';
  };

  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  return (
    <>
      <div ref={hintRef} className="hero-scroll-cue" aria-hidden="true">
        <div className="hero-scroll-cue-inner">
          <div className="hero-scroll-mouse" aria-hidden="true">
            <span className="hero-scroll-wheel" />
          </div>
          <span className="hero-scroll-cue-text">{HERO_COPY.scrollCue}</span>
          <span className="hero-scroll-chevrons" aria-hidden="true">
            <span className="hero-scroll-chevron" />
            <span className="hero-scroll-chevron" />
          </span>
        </div>
      </div>

      <div ref={titleRef} className="hero-title-overlay">
        <h1 className="hero-title-main">پیراهن مردانه</h1>
        <div className="hero-title-divider" aria-hidden="true" />
        <p className="hero-title-url">WWW.PIRAHANMARDANE.IR</p>
        <AntiMetalButton
          label="فروشگاه"
          className="hero-shop-btn pointer-events-auto mt-4"
          accentFrom={isDark ? '#13ABC4' : '#FF0000'}
          accentTo={isDark ? '#0f96ad' : '#c40000'}
          dotColor="#ffffff"
          onClick={goShop}
        />
      </div>

      <div ref={body1Ref} className="hero-body-overlay hero-body1">
        <p className="hero-body-text hero-body-text--split">
          <span className="hero-body1-line1">مرکز فروش تخصصی</span>
          <span className="hero-body1-line2">پیراهن مردانه</span>
        </p>
      </div>
    </>
  );
}
