'use client';

import { HERO_COPY } from './hero.config';
import AntiMetalButton from "@/components/ui/anti-metal-button";

/**
 * لایه UI روی هیرو (تیتر، متن، CTA، اسکرول‌کیو) — فقط markup/کلاس؛ بدون منطق اسکرول
 */
export default function HeroChrome({
  hintRef,
  titleRef,
  body1Ref,
  body2Ref,
  onShopClick,
}) {
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
        <h1 className="hero-title-main">{HERO_COPY.title}</h1>
        <div className="hero-title-divider" />
        <p className="hero-title-url">{HERO_COPY.url}</p>
        {typeof onShopClick === 'function' && (
          <AntiMetalButton
            label="فروشگاه"
            className="hero-shop-btn pointer-events-auto"
            accentFrom={typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "#13ABC4" : "#FF0000"}
              accentTo={typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "#0f96ad" : "#c40000"}
            dotColor={typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "#0f0f0f" : "#ffffff"}
            onClick={() => { if (typeof window !== "undefined") window.location.href = "/فروشگاه"; }}
          />
        )}
      </div>

      <div ref={body1Ref} className="hero-body-overlay">
        <p className="hero-body-text hero-body-text--split">
          <span className="hero-body1-line1">{HERO_COPY.body1Line1}</span>
          <span className="hero-body1-space"> </span>
          <span className="hero-body1-line2">{HERO_COPY.body1Line2}</span>
        </p>
      </div>

      <div ref={body2Ref} className="hero-body-overlay">
        <p className="hero-body-text">
          <span className="hero-body-line1">{HERO_COPY.body2Line1}</span>
          <span className="hero-body-space"> </span>
          <span className="hero-body-line2">{HERO_COPY.body2Line2}</span>
        </p>
      </div>
    </>
  );
}
