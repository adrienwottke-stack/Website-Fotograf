"use client";

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';

interface ImageTrailProps {
  images: string[];
  sources?: { srcSet: string; position?: string }[];
  imageWidth?: number;
  imageHeight?: number;
  threshold?: number;
  duration?: number;
}

/** Pointer-driven image trail, adapted from the supplied React/GSAP component. */
export function ImageTrail({ images, sources, imageWidth = 200, imageHeight = 200, threshold = 50, duration = 1.6 }: ImageTrailProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [prepared, setPrepared] = useState(0);

  useEffect(() => {
    const content = contentRef.current;
    const stage = content?.closest<HTMLElement>('[data-hero-trail-stage]');
    if (!content || !stage || images.length === 0) return;

    const elements = Array.from(content.querySelectorAll<HTMLImageElement>('img'));
    const allowed = matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    // One timeline per image: reusing a photo also disposes its previous timeline.
    const timelines = new Map<HTMLImageElement, gsap.core.Timeline>();
    let current = { x: 0, y: 0 };
    let cached = { x: 0, y: 0 };
    let last = { x: 0, y: 0 };
    let rect = stage.getBoundingClientRect();
    let position = 0;
    let zIndex = 0;
    let frame = 0;
    let entered = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const reset = () => {
      clearTimeout(idleTimer);
      entered = false;
      cancelAnimationFrame(frame);
      frame = 0;
      timelines.forEach(timeline => timeline.kill());
      timelines.clear();
      gsap.set(elements, { clearProps: 'transform,opacity,zIndex' });
      delete stage.dataset.trailActive;
      delete stage.dataset.trailIdle;
      zIndex = 0;
    };

    const armIdle = () => {
      clearTimeout(idleTimer);
      if (!allowed.matches || document.hidden) return;
      idleTimer = setTimeout(() => {
        reset();
        stage.dataset.trailIdle = 'true';
      }, 3000);
    };

    const suspend = () => {
      reset();
      if (stage.getBoundingClientRect().bottom > 0) armIdle();
    };

    const leave = () => {
      entered = false;
      cancelAnimationFrame(frame);
      frame = 0;
      // Keep the three-second countdown from the last mouse movement.
    };

    const render = () => {
      frame = 0;
      if (!entered || !allowed.matches) return;
      cached.x += (current.x - cached.x) * 0.18;
      cached.y += (current.y - cached.y) * 0.18;
      if (Math.hypot(current.x - last.x, current.y - last.y) < threshold) return;
      const image = elements[position];
      if (!image.complete || image.naturalWidth === 0) return;

      const width = Math.min(imageWidth, rect.width * 0.26);
      const height = width * imageHeight / imageWidth;
      timelines.get(image)?.kill();
      stage.dataset.trailActive = 'true';
      const settle = Math.max(0.4, duration - 1);
      const timeline = gsap.timeline()
          .set(image, {
            opacity: 1, zIndex: ++zIndex,
            x: cached.x - width / 2, y: cached.y - height / 2,
          })
          .to(image, {
            duration, ease: 'expo.out',
            x: current.x - width / 2, y: current.y - height / 2,
          })
          .to(image, { duration: 1, opacity: 0, ease: 'power1.out' }, settle)
          .to(image, { duration: 1, y: `+=${rect.height + height / 2}`, ease: 'power4.inOut' }, settle);
      timelines.set(image, timeline);
      last = { ...current };
      position = (position + 1) % elements.length;
      setPrepared(count => Math.min(images.length, Math.max(count, position + 3)));
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !allowed.matches) return;
      delete stage.dataset.trailIdle;
      stage.dataset.trailActive = 'true';
      armIdle();
      // Read once per pointer event; GSAP performs only transform/opacity writes.
      rect = stage.getBoundingClientRect();
      current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (!entered) {
        entered = true;
        cached = { ...current };
        last = { ...current };
        setPrepared(count => Math.max(count, 3));
      }
      if (!frame) frame = requestAnimationFrame(render);
    };

    const visibility = () => { if (document.hidden) reset(); else armIdle(); };
    armIdle();
    stage.addEventListener('pointermove', move, { passive: true });
    stage.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', suspend, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('astro:before-swap', reset);
    allowed.addEventListener('change', suspend);

    return () => {
      reset();
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', suspend);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('astro:before-swap', reset);
      allowed.removeEventListener('change', suspend);
    };
  }, [images, sources, imageWidth, imageHeight, threshold, duration]);

  return (
    <div ref={contentRef} className="image-trail" aria-hidden="true" style={{ '--trail-width': `${imageWidth}px`, '--trail-ratio': `${imageWidth} / ${imageHeight}` } as CSSProperties}>
      {images.map((url, index) => (
        <img key={`${url}-${index}`} className="image-trail__image" src={index < prepared ? url : undefined} srcSet={index < prepared ? sources?.[index]?.srcSet : undefined} width={imageWidth} height={imageHeight} sizes={`(max-width: 960px) 26vw, ${imageWidth}px`} decoding="async" alt="" draggable={false} style={{ objectPosition: sources?.[index]?.position }} />
      ))}
    </div>
  );
}

export default ImageTrail;
