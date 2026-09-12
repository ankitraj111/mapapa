'use client';

import React, { useEffect, useRef } from 'react';

interface ParallaxSkylineProps {
  imageSrc?: string;
}

export default function ParallaxSkyline({
  imageSrc = '/images/hero-taj-skyline.jpg'
}: ParallaxSkylineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = rootRef.current;
    const skylineEl = skylineRef.current;
    if (!rootEl || !skylineEl) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rootEl.style.opacity = '0.90';
      return;
    }

    let targetRatio = 0;
    let currentRatio = -1;
    let animFrameId = 0;
    let isLoopRunning = false;
    const startTime = performance.now();
    const pointerOffset = { x: 0, y: 0 };

    const onPointerMove = (e: MouseEvent) => {
      pointerOffset.x = e.clientX / window.innerWidth - 0.5;
      pointerOffset.y = e.clientY / window.innerHeight - 0.5;
      triggerLoop();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const applyTransform = (t: number) => {
      if (!skylineEl || !rootEl) return;

      // Sizing: scaled down so the Taj Mahal & architectural skyline are compact, delicate, and elegant (~210px–240px)
      const isMobile = window.innerWidth < 768;
      const baseScale = isMobile ? 0.70 : 0.64;
      const introEase = 1 - Math.pow(1 - Math.min(1, (performance.now() - startTime) / 1400), 3);
      const scale = baseScale * (1.02 - 0.02 * introEase);

      skylineEl.style.transformOrigin = '0% 100%';
      
      const visualWidth = skylineEl.offsetWidth * scale;
      
      // Taj Mahal central dome is at col 1264 out of 2750 (~46% of the panorama)
      // At t = 0 (top of page), center Taj Mahal at ~48% of screen width in Hero
      const tajPosInVisual = visualWidth * (1264 / 2750);
      const startX = (window.innerWidth * 0.48) - tajPosInVisual;
      const minX = window.innerWidth - visualWidth; // Furthest left without creating gap on right
      const safeStartX = Math.min(0, Math.max(minX, startX)); // Ensure no empty gap on left
      const maxTravel = Math.max(0, safeStartX - minX);

      // When page scrolls down (t increases from 0 to 1), translateX moves left (negative) -> (←)
      // When page scrolls up (t decreases from 1 to 0), translateX moves right back towards safeStartX -> (→)
      const x = safeStartX - t * maxTravel + -10 * pointerOffset.x;
      const y = -6 * pointerOffset.y;

      skylineEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

      // Smoothly fade out as user scrolls towards bottom CTA and footer so footer is 100% clean and legible
      const footerFade = t > 0.70 ? Math.max(0, 1 - (t - 0.70) / 0.15) : 1;
      rootEl.style.opacity = `${0.92 * footerFade}`;
    };

    const updateLoop = () => {
      // Fluid spring interpolation (0.16) for buttery 60fps responsive glide
      currentRatio += (targetRatio - currentRatio) * 0.16;
      const isIntroDone = performance.now() - startTime > 1400;

      if (Math.abs(targetRatio - currentRatio) < 0.0003 && isIntroDone) {
        currentRatio = targetRatio;
        applyTransform(currentRatio);
        isLoopRunning = false;
        return;
      }

      applyTransform(currentRatio);
      animFrameId = requestAnimationFrame(updateLoop);
    };

    const triggerLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        animFrameId = requestAnimationFrame(updateLoop);
      }
    };

    const onScrollOrResize = () => {
      const doc = document.documentElement;
      // Continuous full-page scroll travel:
      // Maps vertical scroll across the ENTIRE landing page height from top (0) to bottom footer (1)
      // The image continuously moves as long as the user scrolls down the landing page
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      if (maxScroll <= 0) {
        targetRatio = 0;
        return;
      }
      targetRatio = Math.min(1, Math.max(0, doc.scrollTop / maxScroll));
      triggerLoop();
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Initial calculation
    onScrollOrResize();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="sky-root pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={{ opacity: 0.92 }}
    >
      <div
        ref={skylineRef}
        className="absolute bottom-0 left-0 w-[190vw] max-w-none md:w-[230vw]"
        style={{ willChange: 'transform' }}
      >
        <div className="relative">
          <img
            src={imageSrc}
            alt="Heritage & World Architectural Skyline: Gateway of India, Taj Mahal, Qutub Minar, Charminar, Statue of Liberty, Modern Skyscrapers and Telecom Tower"
            className="block h-auto w-full mix-blend-multiply select-none"
            loading="eager"
            decoding="async"
          />

          {/* SVG Pulsing Glowing Beacons - Positioned exactly on 2750x724 coordinates */}
          <svg
            viewBox="0 0 2750 724"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
            fill="none"
          >
            {/* 1. Beacon over Taj Mahal Central Dome Tip (cx: 1264, cy: 335) */}
            <circle cx="1264" cy="335" r="4.5" fill="#e8572a" />
            <circle
              cx="1264"
              cy="335"
              r="14"
              className="animate-ping"
              stroke="#e8572a"
              strokeOpacity="0.75"
              strokeWidth="1.5"
            />

            {/* 2. Beacon over Statue of Liberty Torch (cx: 2102, cy: 373) */}
            <circle cx="2102" cy="373" r="4.5" fill="#f59e0b" />
            <circle
              cx="2102"
              cy="373"
              r="13"
              className="animate-ping"
              stroke="#f59e0b"
              strokeOpacity="0.8"
              strokeWidth="1.5"
            />

            {/* 3. Beacon over Telecom Tower Tip (cx: 2538, cy: 159) */}
            <circle cx="2538" cy="159" r="4" fill="#e8572a" />
            <circle
              cx="2538"
              cy="159"
              r="12"
              className="animate-ping"
              stroke="#e8572a"
              strokeOpacity="0.6"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* Top subtle fade gradient on mobile so hero typography remains perfectly legible */}
      <div
        className="absolute inset-x-0 top-0 h-[45vh] md:hidden pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(247,248,251,0.92) 25%, rgba(247,248,251,0.4) 75%, transparent 100%)'
        }}
      />
    </div>
  );
}
