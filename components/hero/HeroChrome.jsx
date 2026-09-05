'use client';

import { HERO_COPY } from './hero.config';

/**
 * Scroll + عنوان + خط سفید + URL
 */
export default function HeroChrome({ hintRef, titleRef }) {
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
      </div>
    </>
  );
}
