'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Photo } from '../../data/portfolio';
import './infinite-perspective-slider.css';

export interface InfinitePerspectiveSliderItem {
  id: string; title: string; desc: string; href: string; photo: Photo; position?: string;
}
export interface InfinitePerspectiveSliderProps {
  images: InfinitePerspectiveSliderItem[];
  cardWidth?: number; cardGap?: number; perspective?: number; maxRotation?: number;
}

/** Adapted from the supplied infinite slider: wrapped card positions, velocity
 * driven rotation and SplitText. Input is local to this section; vertical page
 * scrolling stays native. The frame loop also stops when motion has settled. */
export default function InfinitePerspectiveSlider({ images, cardWidth = 320, cardGap = 32,
  perspective = 2200, maxRotation = 80 }: InfinitePerspectiveSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const advanceRef = useRef<(direction: number) => void>(() => {});
  const jumpRef = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current, strip = stripRef.current;
    if (!root || !strip || !images.length) return;
    gsap.registerPlugin(SplitText);
    const panel = root.closest<HTMLElement>('[data-theme-panel]');
    const cards = [...strip.querySelectorAll<HTMLElement>('[data-perspective-card]')];
    const setters = cards.map(card => ({ x: gsap.quickSetter(card, 'x', 'px'), rotation: gsap.quickSetter(card, 'rotateY', 'deg') }));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = cardWidth, step = width + cardGap, loopWidth = step * images.length;
    let current = 0, target = 0, rotation = 0, smoothVelocity = 0, activeIndex = 0;
    let frame = 0, visible = false, disposed = false;
    let pointer: { id: number; x: number; y: number; lastX: number; dragging: boolean } | null = null;
    let suppressClick = false;
    const splits: SplitText[] = [];
    const cleanups: (() => void)[] = [];
    const modulo = (value: number, length: number) => ((value % length) + length) % length;
    const allowed = () => !disposed && visible && !document.hidden && !panel?.hidden;

    const position = () => {
      const center = root.clientWidth / 2 - width / 2;
      cards.forEach((card, index) => {
        let x = modulo(index * step - current + center, loopWidth);
        if (x > loopWidth - step) x -= loopWidth;
        setters[index].x(x); setters[index].rotation(reduced.matches ? 0 : rotation);
      });
      const next = modulo(Math.round(current / step), images.length);
      if (next !== activeIndex) { activeIndex = next; setActive(next); }
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const tick = () => {
      frame = 0;
      if (!allowed()) return;
      const delta = target - current;
      if (reduced.matches) { current = target; rotation = 0; smoothVelocity = 0; }
      else {
        current += delta * .1;
        smoothVelocity += (delta - smoothVelocity) * .09;
        const tilt = Math.max(-maxRotation, Math.min(maxRotation, smoothVelocity * .025));
        rotation += (tilt - rotation) * .12;
      }
      if (Math.abs(target - current) < .08 && Math.abs(rotation) < .03) {
        current = target; rotation = 0; smoothVelocity = 0;
        const shift = Math.round(current / loopWidth) * loopWidth;
        current -= shift; target -= shift;
        position(); root.dataset.moving = 'false'; return;
      }
      position(); frame = requestAnimationFrame(tick);
    };
    const start = () => { if (allowed() && !frame) { root.dataset.moving = 'true'; frame = requestAnimationFrame(tick); } };
    const resize = () => {
      if (!root.clientWidth) { stop(); return; }
      const index = Math.round(target / step);
      width = Math.min(root.clientWidth < 640 ? 240 : cardWidth, root.clientWidth * .82);
      step = width + (root.clientWidth < 640 ? 20 : cardGap); loopWidth = images.length * step;
      root.style.setProperty('--ips-card-width', `${width}px`);
      current = target = index * step; rotation = 0; position(); root.dataset.ready = 'true';
    };
    advanceRef.current = direction => { target = (Math.round(target / step) + direction) * step; start(); };
    jumpRef.current = index => {
      const base = index * step;
      target = base + Math.round((current - base) / loopWidth) * loopWidth;
      start();
    };
    const onWheel = (event: WheelEvent) => {
      if (!allowed() || event.ctrlKey || (!event.shiftKey && Math.abs(event.deltaX) < Math.abs(event.deltaY))) return;
      const delta = event.shiftKey ? event.deltaY || event.deltaX : event.deltaX;
      target += delta * (event.deltaMode === 1 ? 16 : 1); start();
    };
    const onDown = (event: PointerEvent) => {
      if (!allowed() || event.button !== 0) return;
      // A fresh press is deliberate input, including the separate gallery link.
      // Residual click suppression from an earlier touch drag must not block it.
      suppressClick = false;
      if ((event.target as HTMLElement).closest('.ips-controls')) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, dragging: false };
    };
    const onMove = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      if (!pointer.dragging && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { pointer = null; return; }
      if (!pointer.dragging && Math.abs(dx) < 8) return;
      if (!pointer.dragging) { pointer.dragging = true; root.setPointerCapture(event.pointerId); root.dataset.dragging = 'true'; }
      suppressClick = true;
      target -= event.clientX - pointer.lastX; pointer.lastX = event.clientX; start();
    };
    const onUp = () => { pointer = null; delete root.dataset.dragging; };
    const onClick = (event: MouseEvent) => {
      if (suppressClick && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    };
    const visibility = () => { if (!allowed()) { stop(); onUp(); } else start(); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visibility(); }, { threshold: .05 });
    observer.observe(root);
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(root);
    const optionObserver = new MutationObserver(() => { resize(); visibility(); });
    if (panel) optionObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    root.addEventListener('wheel', onWheel, { passive: true });
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('click', onClick, true);
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('astro:before-swap', stop);
    reduced.addEventListener('change', visibility);
    resize();

    // The provided masked line reveal, prepared after the local fonts settle.
    void document.fonts.ready.then(() => {
      if (disposed) return;
      cards.forEach(card => {
        const text = card.querySelector<HTMLElement>('.ips-caption')!;
        const split = SplitText.create(text, { type: 'lines', mask: 'lines' }); splits.push(split);
        const enter = () => {
          if (reduced.matches) return;
          gsap.fromTo(split.lines, { yPercent: 100 }, { yPercent: 0, duration: .35, stagger: .045, ease: 'power3.out', overwrite: true });
        };
        card.addEventListener('pointerenter', enter); card.addEventListener('focusin', enter);
        cleanups.push(() => { card.removeEventListener('pointerenter', enter); card.removeEventListener('focusin', enter); gsap.killTweensOf(split.lines); split.revert(); });
      });
    });

    return () => {
      disposed = true; stop(); observer.disconnect(); sizeObserver.disconnect(); optionObserver.disconnect();
      root.removeEventListener('wheel', onWheel); root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove); root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp); root.removeEventListener('click', onClick, true);
      document.removeEventListener('visibilitychange', visibility); document.removeEventListener('astro:before-swap', stop);
      reduced.removeEventListener('change', visibility); cleanups.forEach(cleanup => cleanup());
      gsap.killTweensOf(cards); delete root.dataset.ready;
    };
  }, [images, cardWidth, cardGap, maxRotation]);

  return <div ref={rootRef} className="infinite-perspective-slider" data-perspective-slider
    role="region" aria-label="Themenwelten als endloser Bilderstreifen" tabIndex={0}
    onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); advanceRef.current(event.key === 'ArrowRight' ? 1 : -1);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); jumpRef.current(event.key === 'Home' ? 0 : images.length - 1);
      }
    }}>
    <div className="ips-viewport" style={{ perspective }}>
      <div ref={stripRef} className="ips-strip">
        {images.map((item, index) => <button key={item.id} type="button" data-perspective-card={item.id}
          className={`ips-card${active === index ? ' ips-current' : ''}`} tabIndex={active === index ? 0 : -1}
          aria-label={`${item.title} im Slider auswählen`} draggable={false} onClick={() => jumpRef.current(index)}>
          <div className="ips-image">
            <picture>
              {!!item.photo.avif?.length && <source type="image/avif" srcSet={item.photo.avif.map(v => `${v.src} ${v.width}w`).join(', ')} sizes="(max-width: 640px) 240px, 320px" />}
              <img src={item.photo.preview[0].src} srcSet={item.photo.preview.map(v => `${v.src} ${v.width}w`).join(', ')}
                sizes="(max-width: 640px) 240px, 320px" width={item.photo.width} height={item.photo.height}
                alt={item.photo.alt} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: item.position || 'center' }} />
            </picture>
          </div>
          <div className="ips-caption"><h3>{item.title}</h3><p>{item.desc}</p></div>
        </button>)}
      </div>
    </div>
    <div className="ips-controls">
      <p className="ips-hint">Ziehen und entdecken.</p>
      <div className="ips-pagination"><a className="ips-gallery-link" href={images[active]?.href}>{images[active]?.title} entdecken <ArrowUpRight size={16} aria-hidden="true" /></a><span aria-live="polite">{active + 1} / {images.length}</span></div>
      <div className="ips-arrows">
        <button type="button" onClick={() => advanceRef.current(-1)} aria-label="Vorherige Themenwelt"><ArrowLeft size={20} aria-hidden="true" /></button>
        <button type="button" onClick={() => advanceRef.current(1)} aria-label="Nächste Themenwelt"><ArrowRight size={20} aria-hidden="true" /></button>
      </div>
    </div>
  </div>;
}
