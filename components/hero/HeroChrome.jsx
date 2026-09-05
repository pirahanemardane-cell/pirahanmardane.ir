'use client';

import { HERO_COPY } from './hero.config';

export default function HeroChrome({ hintRef, titleRef, body1Ref }) {
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

      <div ref={body1Ref} className="hero-body-overlay hero-body1">
        <p className="hero-body-text hero-body-text--split">
          <span className="hero-body1-line1">مرکز فروش تخصصی</span>
          <span className="hero-body1-line2">پیراهن مردانه</span>
        </p>
      </div>
    </>
  );
}
