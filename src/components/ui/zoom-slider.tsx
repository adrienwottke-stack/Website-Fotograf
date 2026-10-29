'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Photo } from '../../data/portfolio';
import './zoom-slider.css';

export interface ZoomSliderItem { id: string; title: string; desc: string; href: string; photo: Photo; position?: string }
export interface ZoomSliderProps {
  sliderData: ZoomSliderItem[]; size?: number; easeScrollPercentage?: number;
  scaleOnHover?: boolean; textOnHover?: boolean;
}

/** The supplied quadratic zoom-strip geometry, scoped to the themes section.
 * Fixed image planes plus transforms replace per-frame width/height layout;
 * an inverse image transform preserves the photographs' proportions. */
export function ZoomSliderComp({ sliderData: images, size = 1, easeScrollPercentage = 100,
  scaleOnHover = true, textOnHover = true }: ZoomSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null), sceneRef = useRef<HTMLDivElement>(null);
  const advanceRef = useRef<(direction: number) => void>(() => {});
  const jumpRef = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current, scene = sceneRef.current;
    if (!root || !scene || !images.length) return;
    gsap.registerPlugin(SplitText);
    const panel = root.closest<HTMLElement>('[data-theme-panel]');
    const cards = [...scene.querySelectorAll<HTMLAnchorElement>('[data-zoom-card]')];
    const setters = cards.map(card => ({
      x: gsap.quickSetter(card, 'x', 'px'), sx: gsap.quickSetter(card, 'scaleX'), sy: gsap.quickSetter(card, 'scaleY'),
      image: gsap.quickSetter(card.querySelector('.zoom-image-plane'), 'scaleX'),
      textX: gsap.quickSetter(card.querySelector('.zoom-caption'), 'scaleX'),
      textY: gsap.quickSetter(card.querySelector('.zoom-caption'), 'scaleY'),
    }));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let step = 640, maxHeight = 420, minHeight = 50, loopWidth = step * images.length;
    let current = 0, target = 0, velocity = 0, frame = 0, activeIndex = 0;
    let visible = false, disposed = false;
    let pointer: { id: number; x: number; y: number; last: number; dragging: boolean } | null = null;
    let suppressClick = false;
    const cleanups: (() => void)[] = [];
    const modulo = (value: number, count: number) => ((value % count) + count) % count;
    const allowed = () => !disposed && visible && !document.hidden && !panel?.hidden;
    const position = () => {
      const easingDistance = 2 * scene.clientWidth * Math.max(.2, easeScrollPercentage / 100);
      const map = (value: number) => value <= 0 ? 0 : value >= easingDistance ? value - easingDistance / 2 : value * value / (2 * easingDistance);
      const offset = modulo(current, loopWidth), start = Math.floor(offset / step), fraction = (offset % step) / step;
      for (let i = 0; i < cards.length; i++) {
        const index = (start + i) % cards.length;
        const distance = (i - fraction) * step;
        const x = map(distance), width = Math.max(.01, map(distance + step) - x);
        const sx = Math.max(.0001, width / step);
        const sy = (minHeight + sx * (maxHeight - minHeight)) / maxHeight;
        const setter = setters[index];
        setter.x(x); setter.sx(sx); setter.sy(sy);
        setter.image(sy / sx); setter.textX(1 / sx); setter.textY(1 / sy);
      }
      if (start !== activeIndex) { activeIndex = start; setActive(start); }
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; root.dataset.moving = 'false'; };
    const tick = () => {
      frame = 0; if (!allowed()) return;
      if (!reduced.matches && !pointer?.dragging && Math.abs(velocity) > .1) { target += velocity; velocity *= .92; }
      else if (!pointer?.dragging) velocity = 0;
      current += (target - current) * (reduced.matches ? 1 : pointer?.dragging ? .22 : .08);
      if (Math.abs(target - current) < .05 && Math.abs(velocity) <= .1) {
        current = target; velocity = 0;
        const shift = Math.round(current / loopWidth) * loopWidth; current -= shift; target -= shift;
        position(); root.dataset.moving = 'false'; return;
      }
      position(); frame = requestAnimationFrame(tick);
    };
    const start = () => { if (allowed() && !frame) { root.dataset.moving = 'true'; frame = requestAnimationFrame(tick); } };
    const resize = () => {
      if (!scene.clientWidth) { stop(); return; }
      const index = Math.round(target / step), mobile = scene.clientWidth < 640;
      step = Math.min((mobile ? 260 : 680) * Math.max(.5, size), scene.clientWidth * .8);
      maxHeight = scene.clientHeight * .82; minHeight = mobile ? 70 : 50; loopWidth = images.length * step;
      root.style.setProperty('--zoom-card-width', `${step}px`); root.style.setProperty('--zoom-card-height', `${maxHeight}px`);
      current = target = index * step; velocity = 0; position(); root.dataset.ready = 'true';
    };
    advanceRef.current = direction => { velocity = 0; target = (Math.round(target / step) + direction) * step; start(); };
    jumpRef.current = index => { velocity = 0; const base = index * step; target = base + Math.round((current - base) / loopWidth) * loopWidth; start(); };
    const wheel = (event: WheelEvent) => {
      if (!allowed() || event.ctrlKey || (!event.shiftKey && Math.abs(event.deltaX) < Math.abs(event.deltaY))) return;
      velocity = 0; target += (event.shiftKey ? event.deltaY || event.deltaX : event.deltaX) * (event.deltaMode === 1 ? 16 : 1); start();
    };
    const down = (event: PointerEvent) => {
      if (!allowed() || event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, last: event.clientX, dragging: false }; velocity = 0; suppressClick = false;
    };
    const move = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      if (!pointer.dragging && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { pointer = null; return; }
      if (!pointer.dragging && Math.abs(dx) < 8) return;
      if (!pointer.dragging) { pointer.dragging = true; scene.setPointerCapture(event.pointerId); }
      const delta = pointer.last - event.clientX; target += delta; velocity += (delta - velocity) * .5;
      pointer.last = event.clientX; suppressClick = true; root.dataset.dragging = 'true'; start();
    };
    const up = () => { pointer = null; delete root.dataset.dragging; start(); };
    const click = (event: MouseEvent) => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; } };
    const visibility = () => { if (!allowed()) { stop(); pointer = null; velocity = 0; delete root.dataset.dragging; } else start(); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visibility(); }, { threshold: .05 }); observer.observe(root);
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(scene);
    const optionObserver = new MutationObserver(() => { resize(); visibility(); });
    if (panel) optionObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    scene.addEventListener('wheel', wheel, { passive: true }); scene.addEventListener('pointerdown', down);
    scene.addEventListener('pointermove', move); scene.addEventListener('pointerup', up); scene.addEventListener('pointercancel', up);
    scene.addEventListener('click', click, true);
    document.addEventListener('visibilitychange', visibility); document.addEventListener('astro:before-swap', stop);
    reduced.addEventListener('change', visibility); resize();

    void document.fonts.ready.then(() => {
      if (disposed) return;
      cards.forEach(card => {
        const caption = card.querySelector<HTMLElement>('.zoom-caption')!;
        const picture = card.querySelector<HTMLElement>('.zoom-image-hover')!;
        const split = SplitText.create(caption, { type: 'lines', mask: 'lines' });
        const enter = () => {
          if (reduced.matches) return;
          if (textOnHover) gsap.fromTo(split.lines, { yPercent: 100 }, { yPercent: 0, duration: .45, stagger: .045, ease: 'power3.out', overwrite: true });
          if (scaleOnHover) gsap.to(picture, { scale: 1.05, duration: .6, ease: 'power2.out', overwrite: true });
        };
        const leave = () => { if (scaleOnHover) gsap.to(picture, { scale: 1, duration: reduced.matches ? 0 : .6, overwrite: true }); };
        card.addEventListener('pointerenter', enter); card.addEventListener('focusin', enter);
        card.addEventListener('pointerleave', leave); card.addEventListener('focusout', leave);
        cleanups.push(() => {
          card.removeEventListener('pointerenter', enter); card.removeEventListener('focusin', enter);
          card.removeEventListener('pointerleave', leave); card.removeEventListener('focusout', leave);
          gsap.killTweensOf([picture, ...split.lines]); split.revert();
        });
      });
    });
    return () => {
      disposed = true; stop(); observer.disconnect(); sizeObserver.disconnect(); optionObserver.disconnect();
      scene.removeEventListener('wheel', wheel); scene.removeEventListener('pointerdown', down); scene.removeEventListener('pointermove', move);
      scene.removeEventListener('pointerup', up); scene.removeEventListener('pointercancel', up); scene.removeEventListener('click', click, true);
      document.removeEventListener('visibilitychange', visibility); document.removeEventListener('astro:before-swap', stop);
      reduced.removeEventListener('change', visibility); cleanups.forEach(cleanup => cleanup()); delete root.dataset.ready;
    };
  }, [images, size, easeScrollPercentage, scaleOnHover, textOnHover]);

  return <div ref={rootRef} className="zoom-slider" data-zoom-slider role="region" aria-label="Themenwelten als Zoom-Bildfolge" tabIndex={0}
    onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); advanceRef.current(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); jumpRef.current(event.key === 'Home' ? 0 : images.length - 1); }
    }}>
    <div ref={sceneRef} className="zoom-scene">
      {images.map((item, index) => <a key={item.id} className="zoom-card" data-zoom-card={item.id} href={item.href}
        tabIndex={active === index ? 0 : -1} aria-label={`${item.title} entdecken`} draggable={false} onFocus={() => jumpRef.current(index)}>
        <div className={`zoom-caption${textOnHover ? '' : ' zoom-caption--visible'}`}><h3>{item.title}</h3><p>{item.desc}</p></div>
        <div className="zoom-image-frame"><div className="zoom-image-plane"><div className="zoom-image-hover">
          <picture>
            {!!item.photo.avif?.length && <source type="image/avif" srcSet={item.photo.avif.map(v => `${v.src} ${v.width}w`).join(', ')} sizes="(max-width: 640px) 260px, 640px" />}
            <img src={item.photo.preview[0].src} srcSet={item.photo.preview.map(v => `${v.src} ${v.width}w`).join(', ')} sizes="(max-width: 640px) 260px, 640px"
              width={item.photo.width} height={item.photo.height} alt={item.photo.alt} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: item.position || 'center' }} />
          </picture>
        </div></div></div>
      </a>)}
    </div>
    <div className="zoom-controls"><p>Ziehen und entdecken.</p><div className="zoom-pagination" aria-live="polite"><span>{images[active]?.title}</span><span>{active + 1} / {images.length}</span></div>
      <div className="zoom-arrows"><button type="button" aria-label="Vorherige Zoom-Themenwelt" onClick={() => advanceRef.current(-1)}><ArrowLeft size={20} aria-hidden="true" /></button><button type="button" aria-label="Nächste Zoom-Themenwelt" onClick={() => advanceRef.current(1)}><ArrowRight size={20} aria-hidden="true" /></button></div>
    </div>
  </div>;
}

export default ZoomSliderComp;
