'use client';

import { useEffect, useRef, useCallback, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { FRAME_COUNT, FRAME_PATH, HERO_POSTER, HERO_VIDEO, HERO_COPY } from './hero.config';
import { isTouchOrMobile, lockScroll, unlockScroll } from './hero.utils';
import HeroChrome from './HeroChrome';

gsap.registerPlugin(ScrollTrigger);


const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
function toFaDigits(n) {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[d]);
}

export default function Hero({ onShopClick, onHeroProgress } = {}) {
  const videoRef = useRef(null);
  const frameImgRef = useRef(null);
  const sectionRef = useRef(null);
  const progressFillRef = useRef(null);
  const hintRef = useRef(null);
  const titleRef = useRef(null);
  const body1Ref = useRef(null);
  const body2Ref = useRef(null);
  const progressRailRef = useRef(null);

  const targetTimeRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef(null);
  const framesCacheRef = useRef([]);
  const useFramesRef = useRef(false);
  const lastDrawnFrameRef = useRef(-1);

  const [useFrames, setUseFrames] = useState(false);
  const [ready, setReady] = useState(false);
  // ⛔ heroReady + gate: فقط با دستور صریح کاربر تغییر کند (نگاه کنید به کامنت lockScroll)
  const [heroReady, setHeroReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);

  useLayoutEffect(() => {
    const mobile = isTouchOrMobile();
    useFramesRef.current = mobile;
    setUseFrames(mobile);
    setReady(true);
    // ⛔ Lock scroll immediately until hero assets are fully loaded — بدون دستور کاربر تغییر نده
    lockScroll();
    // Prevent ScrollTrigger from refreshing on iOS URL-bar show/hide
    // (that refresh is a main cause of the temporary white gap under the pin)
    try {
      ScrollTrigger.config({ ignoreMobileResize: true });
    } catch (_) {}
  }, []);

  const renderLoop = useCallback(() => {
    if (useFramesRef.current) {
      const img = frameImgRef.current;
      const frames = framesCacheRef.current;
      let idx = targetFrameRef.current;

      if (!frames[idx] || !frames[idx].complete || !frames[idx].naturalWidth) {
        for (let i = idx; i >= 0; i--) {
          if (frames[i] && frames[i].complete && frames[i].naturalWidth > 0) {
            idx = i;
            break;
          }
        }
      }

      if (
        img &&
        frames[idx] &&
        frames[idx].complete &&
        frames[idx].naturalWidth > 0 &&
        lastDrawnFrameRef.current !== idx
      ) {
        img.src = frames[idx].src;
        lastDrawnFrameRef.current = idx;
      }
    } else {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        const target = targetTimeRef.current;
        if (Math.abs(video.currentTime - target) > 0.008) {
          try {
            video.currentTime = target;
          } catch (_) {}
        }
      }
    }
    rafIdRef.current = requestAnimationFrame(renderLoop);
  }, []);

  useEffect(() => {
    if (!ready) return;

    let scrollTriggerInstance = null;
    let lenis = null;
    let cueTween = null;
    let tickerFn = null;
    let cancelled = false;
    let softTickId = null;

    const setOpacity = (el, opacity) => {
      if (!el) return;
      el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    };

    const setupScrollTrigger = (scrollDistance, onProgress) => {
      if (hintRef.current) {
        gsap.set(hintRef.current, { opacity: 1 });
        const inner = hintRef.current.querySelector('.hero-scroll-cue-inner');
        if (inner) {
          gsap.set(inner, { y: 0 });
          cueTween = gsap.to(inner, {
            y: 8,
            duration: 1.1,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
          });
        }
      }
      if (titleRef.current) gsap.set(titleRef.current, { opacity: 0 });
      if (body1Ref.current) gsap.set(body1Ref.current, { opacity: 0 });
      if (body2Ref.current) gsap.set(body2Ref.current, { opacity: 0 });

      // Mobile: lock hero height to actual visual viewport so pin doesn't
      // leave a white gap under the fixed section when the URL bar toggles.
      const syncHeroHeight = () => {
        const el = sectionRef.current;
        if (!el) return;
        if (useFramesRef.current) {
          const h = Math.round(
            (window.visualViewport && window.visualViewport.height) ||
              window.innerHeight
          );
          if (h > 0) {
            el.style.height = `${h}px`;
            el.style.minHeight = `${h}px`;
          }
        } else {
          el.style.height = '';
          el.style.minHeight = '';
        }
      };
      syncHeroHeight();

      if (!useFramesRef.current) {
        // prevent: اسکرول عمودی داخل فیلتر/دراپ‌داون/کارت‌ها را به native بسپار
        const isNestedScrollable = (node) => {
          let el = node;
          while (el && el !== document.body && el !== document.documentElement) {
            if (el.hasAttribute?.('data-lenis-prevent')) return true;
            const style = window.getComputedStyle(el);
            const oy = style.overflowY;
            const ox = style.overflowX;
            if (
              ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
                el.scrollHeight > el.clientHeight + 1) ||
              ((ox === 'auto' || ox === 'scroll' || ox === 'overlay') &&
                el.scrollWidth > el.clientWidth + 1 &&
                (el.classList?.contains('carousel-track') ||
                  el.classList?.contains('product-slider') ||
                  el.classList?.contains('overflow-y-auto')))
            ) {
              return true;
            }
            el = el.parentElement;
          }
          return false;
        };

        lenis = new Lenis({
          duration: 0.9,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.4,
          // جلوگیری از گیر کردن اسکرول وقتی کاربر سریع جهت عوض می‌کند
          syncTouch: false,
          prevent: (node) => isNestedScrollable(node),
        });

        lenis.on('scroll', ScrollTrigger.update);
        tickerFn = (time) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);

        const onScrollLock = (e) => {
          try {
            if (e?.detail) lenis?.stop?.();
            else lenis?.start?.();
          } catch (_) {}
        };
        window.addEventListener('pm-scroll-lock', onScrollLock);
        lenis._pmScrollLock = onScrollLock;
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: true,
        // fixed pin is more stable on iOS than transform pin for full-viewport heroes
        pinType: useFramesRef.current ? 'fixed' : 'transform',
        scrub: useFramesRef.current ? 0.15 : 0.4,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          onProgress(progress);
          try { onHeroProgress?.(progress >= 0.999 ? 1 : progress); } catch (_) {}

          if (progressFillRef.current) {
            progressFillRef.current.style.height = `${progress * 100}%`;
          }

          if (hintRef.current) {
            if (progress > 0.015 && progress < 0.92) {
              hintRef.current.classList.add('hidden');
              if (cueTween) cueTween.pause();
            } else {
              hintRef.current.classList.remove('hidden');
              if (cueTween) cueTween.resume();
            }
          }

          if (titleRef.current) {
            if (progress > 0.02 && progress < 0.08) {
              setOpacity(titleRef.current, (progress - 0.02) / 0.06);
            } else if (progress >= 0.08 && progress < 0.16) {
              setOpacity(titleRef.current, 1);
            } else if (progress >= 0.16 && progress < 0.26) {
              setOpacity(titleRef.current, 1 - (progress - 0.16) / 0.1);
            } else {
              setOpacity(titleRef.current, 0);
            }
          }

          if (body1Ref.current) {
            if (progress > 0.28 && progress < 0.34) {
              setOpacity(body1Ref.current, (progress - 0.28) / 0.06);
            } else if (progress >= 0.34 && progress < 0.44) {
              setOpacity(body1Ref.current, 1);
            } else if (progress >= 0.44 && progress < 0.52) {
              setOpacity(body1Ref.current, 1 - (progress - 0.44) / 0.08);
            } else {
              setOpacity(body1Ref.current, 0);
            }
          }

          if (body2Ref.current) {
            if (progress > 0.54 && progress < 0.6) {
              setOpacity(body2Ref.current, (progress - 0.54) / 0.06);
            } else if (progress >= 0.6 && progress < 0.72) {
              setOpacity(body2Ref.current, 1);
            } else if (progress >= 0.72 && progress < 0.82) {
              setOpacity(body2Ref.current, 1 - (progress - 0.72) / 0.1);
            } else {
              setOpacity(body2Ref.current, 0);
            }
          }

          if (progressRailRef.current) {
            if (progress > 0.01 && progress < 0.98) {
              progressRailRef.current.classList.add('visible');
            } else {
              progressRailRef.current.classList.remove('visible');
            }
          }
        },
        onLeave: () => {
          if (useFramesRef.current) {
            targetFrameRef.current = FRAME_COUNT - 1;
          } else if (videoRef.current) {
            targetTimeRef.current = videoRef.current.duration || 0;
          }
          try { onHeroProgress?.(1); } catch (_) {}
        },
        onLeaveBack: () => {
          targetFrameRef.current = 0;
          targetTimeRef.current = 0;
          // هدر بعد از اولین پایان هیرو دیگر مخفی نمی‌شود — progress صفر به والد نفرست
        },
      });

      // Orientation: full refresh. URL-bar only: resize element height (no ST refresh)
      // so the fixed pin always covers the visible viewport without white gap.
      const onOrientation = () => {
        syncHeroHeight();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      const onVisualViewport = () => {
        if (!useFramesRef.current) return;
        const el = sectionRef.current;
        if (!el) return;
        const h = Math.round(
          (window.visualViewport && window.visualViewport.height) ||
            window.innerHeight
        );
        if (h > 0) {
          el.style.height = `${h}px`;
          el.style.minHeight = `${h}px`;
        }
      };
      window.addEventListener('orientationchange', onOrientation);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onVisualViewport);
      }
      scrollTriggerInstance._heroOnOrientation = onOrientation;
      scrollTriggerInstance._heroOnVisualViewport = onVisualViewport;

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null); // failed frame → skip, never show broken icon
        img.src = src;
        if (img.complete && img.naturalWidth > 0) {
          resolve(img);
        }
      });

    const finishReady = () => {
      if (cancelled) return;
      unlockScroll();
      setHeroReady(true);
      setLoadPct(100);
      // Ensure scroll position is at top when unlocking
      window.scrollTo(0, 0);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const initFrames = async () => {
      framesCacheRef.current = new Array(FRAME_COUNT);
      targetFrameRef.current = 0;
      lastDrawnFrameRef.current = -1;

      // PageSpeed mobile: load every Nth frame (~14 imgs) instead of all 70
      const FRAME_STEP = 2;
      const indices = [];
      for (let i = 1; i <= FRAME_COUNT; i += FRAME_STEP) indices.push(i);
      if (indices[indices.length - 1] !== FRAME_COUNT) indices.push(FRAME_COUNT);

      let loaded = 0;
      const total = indices.length;
      const BATCH = 4;
      for (let b = 0; b < indices.length; b += BATCH) {
        if (cancelled) return;
        const slice = indices.slice(b, b + BATCH);
        await Promise.all(
          slice.map((i) =>
            loadImage(FRAME_PATH(i)).then((img) => {
              if (img && img.naturalWidth > 0) {
                framesCacheRef.current[i - 1] = img;
              } else {
                framesCacheRef.current[i - 1] = null;
              }
              loaded += 1;
              if (!cancelled) {
                setLoadPct(Math.min(99, Math.round((loaded / total) * 100)));
              }
            })
          )
        );
        if (b === 0 && frameImgRef.current) {
          const first = framesCacheRef.current.find((f) => f && f.naturalWidth > 0);
          if (first) {
            frameImgRef.current.src = first.src;
            lastDrawnFrameRef.current = framesCacheRef.current.indexOf(first);
          } else {
            frameImgRef.current.src = '/hero-poster.jpg';
          }
        }
      }

      if (cancelled) return;

      const scrollDistance = Math.max(FRAME_COUNT * 20, 1600);
      setupScrollTrigger(scrollDistance, (progress) => {
        const raw = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.round(progress * (FRAME_COUNT - 1)))
        );
        // snap to nearest loaded frame index
        let best = raw;
        if (!framesCacheRef.current[raw]) {
          for (let d = 0; d < FRAME_COUNT; d++) {
            if (raw - d >= 0 && framesCacheRef.current[raw - d]) {
              best = raw - d;
              break;
            }
            if (raw + d < FRAME_COUNT && framesCacheRef.current[raw + d]) {
              best = raw + d;
              break;
            }
          }
        }
        targetFrameRef.current = best;
      });

      finishReady();
    };

    const initVideo = () => {
      const video = videoRef.current;
      if (!video) return;

      const durationRef = { current: 10 };
      let stReady = false;

      const ensureST = () => {
        if (stReady || cancelled) return;
        stReady = true;
        setupScrollTrigger(2800, (progress) => {
          targetTimeRef.current = progress * durationRef.current;
        });
      };

      const onFullyReady = () => {
        if (cancelled) return;
        if (video.duration && !isNaN(video.duration)) {
          durationRef.current = video.duration;
        }
        try { video.currentTime = 0; } catch (_) {}
        targetTimeRef.current = 0;

        const p = video.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            video.pause();
            try { video.currentTime = 0; } catch (_) {}
          }).catch(() => {});
        }

        ensureST();
        finishReady();
      };

      // Progress from buffered ranges + رویدادهای تکمیلی (فقط نمایش درصد؛ منطق اسکرول/محتوا دست‌نخورده)
      const onProgress = () => {
        try {
          if (!video.duration || isNaN(video.duration) || video.duration <= 0) {
            // اگر duration هنوز معلوم نیست، حداقل پیشرفت ظاهری نشان بده
            setLoadPct((p) => (p < 8 ? 8 : p));
            return;
          }
          let bufferedEnd = 0;
          for (let i = 0; i < video.buffered.length; i++) {
            bufferedEnd = Math.max(bufferedEnd, video.buffered.end(i));
          }
          const pct = Math.min(99, Math.max(1, Math.round((bufferedEnd / video.duration) * 100)));
          setLoadPct((prev) => Math.max(prev, pct));
        } catch (_) {}
      };

      video.addEventListener('progress', onProgress);
      video.addEventListener('loadedmetadata', onProgress);
      video.addEventListener('loadeddata', onProgress);
      video.addEventListener('canplay', onProgress);

      // پیشرفت نرم وقتی مرورگر رویداد progress نمی‌دهد (درصد گیر نکند روی ۰)
      softTickId = setInterval(() => {
        if (cancelled || stReady) return;
        setLoadPct((p) => {
          if (p >= 92) return p;
          if (p < 5) return 5;
          return Math.min(92, p + 3);
        });
        onProgress();
      }, 400);

      // canplaythrough = enough data to play through without stopping
      const onCanPlayThrough = () => {
        if (softTickId) { clearInterval(softTickId); softTickId = null; }
        video.removeEventListener('progress', onProgress);
        video.removeEventListener('loadedmetadata', onProgress);
        video.removeEventListener('loadeddata', onProgress);
        video.removeEventListener('canplay', onProgress);
        video.removeEventListener('canplaythrough', onCanPlayThrough);
        setLoadPct(100);
        onFullyReady();
      };

      video.addEventListener('canplaythrough', onCanPlayThrough, { once: true });

      if (video.readyState >= 4) {
        // HAVE_ENOUGH_DATA already
        onCanPlayThrough();
      } else {
        try { video.load(); } catch (_) {}
        // Safety timeout for very slow networks (max 20s wait then unlock with what we have)
        setTimeout(() => {
          if (cancelled || heroReady) return;
          if (!stReady) {
            if (softTickId) { clearInterval(softTickId); softTickId = null; }
            video.removeEventListener('progress', onProgress);
            video.removeEventListener('loadedmetadata', onProgress);
            video.removeEventListener('loadeddata', onProgress);
            video.removeEventListener('canplay', onProgress);
            video.removeEventListener('canplaythrough', onCanPlayThrough);
            if (video.duration && !isNaN(video.duration)) {
              durationRef.current = video.duration;
            }
            setLoadPct(100);
            ensureST();
            finishReady();
          }
        }, 20000);
      }
    };

    if (useFramesRef.current) {
      initFrames();
    } else {
      const video = videoRef.current;
      if (!video) {
        unlockScroll();
        return;
      }
      initVideo();

      return () => {
        cancelled = true;
        if (softTickId) { clearInterval(softTickId); softTickId = null; }
        unlockScroll();
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (cueTween) cueTween.kill();
        if (tickerFn) gsap.ticker.remove(tickerFn);
        if (scrollTriggerInstance?._heroOnOrientation) {
          window.removeEventListener('orientationchange', scrollTriggerInstance._heroOnOrientation);
        }
        if (scrollTriggerInstance?._heroOnVisualViewport && window.visualViewport) {
          window.visualViewport.removeEventListener('resize', scrollTriggerInstance._heroOnVisualViewport);
        }
        scrollTriggerInstance?.kill();
        if (lenis?._pmScrollLock) {
          window.removeEventListener('pm-scroll-lock', lenis._pmScrollLock);
        }
        lenis?.destroy();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
    }

    return () => {
      cancelled = true;
      if (softTickId) { clearInterval(softTickId); softTickId = null; }
      unlockScroll();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (cueTween) cueTween.kill();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      if (scrollTriggerInstance?._heroOnOrientation) {
        window.removeEventListener('orientationchange', scrollTriggerInstance._heroOnOrientation);
      }
      if (scrollTriggerInstance?._heroOnVisualViewport && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', scrollTriggerInstance._heroOnVisualViewport);
      }
      if (lenis?._pmScrollLock) {
        window.removeEventListener('pm-scroll-lock', lenis._pmScrollLock);
      }
      scrollTriggerInstance?.kill();
      lenis?.destroy();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderLoop, ready, useFrames]);

  return (
    <>
      {/* Loading overlay — blocks interaction until hero is fully ready */}
      {!heroReady && (
        <div
          className="hero-load-gate"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#5C6065',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            pointerEvents: 'all',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_POSTER}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <p
              className="hero-loading-text"
              style={{
                margin: 0,
                fontSize: '0.75rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.85)',
                WebkitTextFillColor: 'rgba(255,255,255,0.85)',
              }}
            >
              <span className="text-lg sm:text-xl font-medium tracking-wide">در حال بارگذاری</span>
            </p>
            <div
              style={{
                width: 96,
                height: 2,
                background: 'rgba(255,255,255,0.15)',
                overflow: 'hidden',
                borderRadius: 1,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${loadPct}%`,
                  background: 'rgba(255,255,255,0.9)',
                  transition: 'width 0.25s ease',
                }}
              />
            </div>
            <p
              className="hero-loading-pct"
              style={{
                margin: 0,
                fontFamily: '"IRANYekanX", sans-serif',
                fontSize: '0.7rem',
                fontWeight: 200,
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.75)',
                WebkitTextFillColor: 'rgba(255,255,255,0.75)',
                textShadow: 'none',
                minWidth: '4ch',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">{toFaDigits(Math.max(0, Math.min(100, loadPct)))}٪</span>
            </p>
          </div>
        </div>
      )}

      <div ref={progressRailRef} className="progress-rail">
        <div ref={progressFillRef} className="progress-fill" />
      </div>

      <section
        ref={sectionRef}
        className="hero-video-section scroll-scrub-video"
        style={{
          backgroundImage: `url(${HERO_POSTER})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {useFrames ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={frameImgRef}
            className="hero-video hero-frame-img"
            src={HERO_POSTER}
            alt=""
            draggable={false}
          />
        ) : (
          <video
            ref={videoRef}
            className="hero-video"
            muted
            playsInline
            preload="metadata"
            poster={HERO_POSTER}
            webkit-playsinline="true"
            x5-playsinline="true"
            disablePictureInPicture
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        )}

        <div className="video-overlay" />

        <HeroChrome
          hintRef={hintRef}
          titleRef={titleRef}
          body1Ref={body1Ref}
          body2Ref={body2Ref}
          onShopClick={onShopClick}
        />
      </section>

      <div
        className="reduced-motion-fallback"
        style={{
          minHeight: '100svh',
          background: '#5C6065',
          display: 'none',
          position: 'relative',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_POSTER}
          alt={HERO_COPY.alt}
          style={{ width: '100%', height: '100svh', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent 30%, rgba(0,0,0,0.2))',
          }}
        />
      </div>
    </>
  );
}