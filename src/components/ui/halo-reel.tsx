'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import type { Photo } from '../../data/portfolio';
import './halo-reel.css';

export interface HaloReelItem { id: string; title: string; desc: string; href: string; photo: Photo; position?: string }
export interface HaloReelProps {
  items: HaloReelItem[]; cardWidth?: number; cardHeight?: number; minScale?: number;
  radiusXRatio?: number; radiusYRatio?: number; centerXRatio?: number;
  autoPlay?: boolean; holdDuration?: number; stepDuration?: number; spread?: number; maxCards?: number;
  draggable?: boolean; dragSensitivity?: number; pauseOnHover?: boolean; centerLabel?: ReactNode;
}
const TAU = Math.PI * 2;
const modulo = (value: number, count: number) => ((value % count) + count) % count;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

/** The supplied halo geometry: one motion value determines the position,
 * scale and stacking of every photograph. Full repeated passes keep the
 * seven-theme sequence consistent across the wrap. */
export function HaloReel({ items, cardWidth = 190, cardHeight = 260, minScale = .4,
  radiusXRatio = .4, radiusYRatio = .34, centerXRatio = 0,
  autoPlay = true, holdDuration = 1800, stepDuration = 850, spread = 1.3, maxCards = 28,
  draggable = true, dragSensitivity = 1, pauseOnHover = true, centerLabel }: HaloReelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const rotation = useMotionValue(0);
  const controls = useRef<ReturnType<typeof animate> | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; angle: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  const activeIndexRef = useRef(0);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [visible, setVisible] = useState(false), [panelActive, setPanelActive] = useState(false);
  const [tabVisible, setTabVisible] = useState(true), [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false), [dragging, setDragging] = useState(false);
  const [manualEpoch, setManualEpoch] = useState(0);
  const count = items.length;
  const mobile = size.w > 0 && size.w < 640;
  const orbitHeight = mobile ? size.h * .6 : size.h;
  const cx = mobile ? .16 : centerXRatio;
  const rx = size.w * (mobile ? .5 : radiusXRatio), ry = orbitHeight * radiusYRatio;
  const rawSlots = Math.ceil(TAU * Math.max(rx / (cardWidth * spread), ry / (cardHeight * spread)));
  const fullPassLimit = Math.max(count, Math.floor(Math.max(count, maxCards) / (count || 1)) * count);
  const slots = count ? clamp(Math.ceil(rawSlots / count) * count, count, fullPassLimit) : 0;
  const step = slots ? TAU / slots : 1;
  const fit = size.w ? clamp(Math.min(size.w / (rx + cardWidth), orbitHeight / (2 * ry + cardHeight)), .45, 1) : .8;
  const cardW = cardWidth * fit, cardH = cardHeight * fit;
  const canAutoPlay = autoPlay && !reduceMotion && !paused && visible && panelActive && tabVisible && !dragging && !focused && !(pauseOnHover && hovered);

  useEffect(() => {
    const root = rootRef.current!;
    const panel = root.closest<HTMLElement>('[data-theme-panel]');
    const measure = () => {
      if (root.clientWidth) setSize(previous => previous.w === root.clientWidth && previous.h === root.clientHeight ? previous : { w: root.clientWidth, h: root.clientHeight });
      setPanelActive(!panel?.hidden);
    };
    const resize = new ResizeObserver(measure); resize.observe(root);
    const intersection = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: .05 }); intersection.observe(root);
    const options = new MutationObserver(measure); if (panel) options.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    const visibility = () => setTabVisible(!document.hidden);
    const leave = () => controls.current?.stop();
    document.addEventListener('visibilitychange', visibility); document.addEventListener('astro:before-swap', leave);
    measure(); visibility();
    return () => { resize.disconnect(); intersection.disconnect(); options.disconnect(); controls.current?.stop(); document.removeEventListener('visibilitychange', visibility); document.removeEventListener('astro:before-swap', leave); };
  }, []);

  useMotionValueEvent(rotation, 'change', value => {
    const index = count ? modulo(Math.round(-value / step), slots) % count : 0;
    if (index !== activeIndexRef.current) { activeIndexRef.current = index; setActive(index); }
  });

  useEffect(() => {
    if (!visible || !panelActive || !tabVisible) controls.current?.stop();
  }, [visible, panelActive, tabVisible]);

  useEffect(() => {
    if (!canAutoPlay || !count) return;
    let timer: ReturnType<typeof setTimeout>, canceled = false;
    let ownControls: ReturnType<typeof animate> | undefined;
    const schedule = () => {
      if (canceled) return;
      timer = setTimeout(() => {
        const next = (Math.round(rotation.get() / step) - 1) * step;
        ownControls = animate(rotation, next, { duration: stepDuration / 1000, ease: [.4, 0, .2, 1], onComplete: schedule });
        controls.current = ownControls;
      }, holdDuration);
    };
    schedule();
    return () => { canceled = true; clearTimeout(timer); ownControls?.stop(); };
  }, [canAutoPlay, count, rotation, step, stepDuration, holdDuration, manualEpoch]);

  const turnTo = (target: number) => {
    controls.current?.stop(); setManualEpoch(epoch => epoch + 1);
    if (reduceMotion) rotation.set(target);
    else controls.current = animate(rotation, target, { duration: stepDuration / 1000, ease: [.4, 0, .2, 1] });
  };
  const spinBy = (direction: number) => turnTo(Math.round(rotation.get() / step) * step - direction * step);
  const select = (index: number) => turnTo(-index * step + TAU * Math.round((rotation.get() + index * step) / TAU));
  const pointerAngle = (event: PointerEvent) => {
    const rect = rootRef.current!.getBoundingClientRect();
    return Math.atan2((event.clientY - rect.top - orbitHeight / 2) / (ry || 1), (event.clientX - rect.left - size.w * cx) / (rx || 1));
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggable || event.button !== 0 || (event.target as HTMLElement).closest('.halo-label,.halo-controls')) return;
    controls.current?.stop(); suppressClick.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: pointerAngle(event), active: false };
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current; if (!state || state.id !== event.pointerId) return;
    const dx = event.clientX - state.x, dy = event.clientY - state.y;
    if (!state.active && event.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { drag.current = null; return; }
    if (!state.active && Math.hypot(dx, dy) < 8) return;
    if (!state.active) { controls.current?.stop(); state.active = true; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); }
    const angle = pointerAngle(event);
    const delta = modulo(angle - state.angle + Math.PI, TAU) - Math.PI;
    state.angle = angle; rotation.set(rotation.get() + delta * dragSensitivity); suppressClick.current = true;
  };
  const up = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current; if (!state || state.id !== event.pointerId) return;
    drag.current = null; setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (state.active) turnTo(Math.round(rotation.get() / step) * step);
    else setManualEpoch(epoch => epoch + 1);
  };
  if (!count) return null;
  const item = items[active];

  return <div ref={rootRef} className={`halo-reel${dragging ? ' halo-reel--dragging' : ''}`} data-halo-reel data-active-theme={item.id}
    data-autoplay={canAutoPlay ? 'true' : 'false'} role="region" aria-roledescription="Karussell" aria-label="Themenwelten als drehender Bilderring" tabIndex={0}
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
    onFocusCapture={event => { if (!(event.target as HTMLElement).closest('.halo-controls')) setFocused(true); }}
    onBlurCapture={event => { const next = event.relatedTarget as HTMLElement | null; setFocused(!!next && event.currentTarget.contains(next) && !next.closest('.halo-controls')); }}
    onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); spinBy(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); select(event.key === 'Home' ? 0 : count - 1); }
    }}>
    <div className="halo-label" style={mobile ? { left: 24, right: 24, top: orbitHeight + 8 } : { left: size.w * cx + rx + cardW / 2 + 32, right: 32 }}>
      {centerLabel || <><p className="halo-count">{active + 1} / {count}</p><h3>{item.title}</h3><p className="halo-description">{item.desc}</p><a href={item.href}>{item.title} entdecken <ArrowUpRight size={19} aria-hidden="true" /></a></>}
    </div>
    {Array.from({ length: slots }, (_, index) => <WheelCard key={index} item={items[index % count]} index={index} step={step}
      rotation={rotation} rx={rx} ry={ry} cx={cx} cy={orbitHeight / 2} width={cardW} height={cardH} minScale={minScale}
      decorative={index >= count} onHover={setHovered} onSelect={force => { if (force || !suppressClick.current) select(index); }} />)}
    <div className="halo-controls">
      <button type="button" aria-label="Vorheriges Ring-Thema" onClick={() => spinBy(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
      <button type="button" aria-label={reduceMotion ? 'Bewegung reduziert' : paused ? 'Drehung fortsetzen' : 'Drehung pausieren'} aria-pressed={paused || reduceMotion} disabled={reduceMotion}
        onClick={() => { controls.current?.stop(); setPaused(value => !value); }}>{paused || reduceMotion ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}</button>
      <button type="button" aria-label="Nächstes Ring-Thema" onClick={() => spinBy(1)}><ArrowRight size={20} aria-hidden="true" /></button>
    </div>
  </div>;
}

function WheelCard({ item, index, step, rotation, rx, ry, cx, cy, minScale, width, height, decorative, onHover, onSelect }: {
  item: HaloReelItem; index: number; step: number; rotation: MotionValue<number>; rx: number; ry: number; cx: number; cy: number;
  minScale: number; width: number; height: number; decorative: boolean; onHover: (hover: boolean) => void; onSelect: (force?: boolean) => void;
}) {
  const cos = useTransform(rotation, value => Math.cos(index * step + value));
  const sin = useTransform(rotation, value => Math.sin(index * step + value));
  const x = useTransform(cos, value => value * rx), y = useTransform(sin, value => value * ry);
  const scale = useTransform(cos, value => minScale + (1 - minScale) * (value + 1) / 2);
  const zIndex = useTransform(scale, value => Math.round(value * 1000));
  return <motion.button type="button" className="halo-card" data-halo-card={item.id} aria-label={`${item.title} nach vorne drehen`}
    aria-hidden={decorative || undefined} tabIndex={decorative ? -1 : 0} onClick={() => onSelect()} onFocus={() => onSelect(true)}
    onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)}
    style={{ x, y, scale, zIndex, width, height, left: `${cx * 100}%`, top: cy, marginLeft: -width / 2, marginTop: -height / 2 }}>
    <picture>
      {!!item.photo.avif?.length && <source type="image/avif" srcSet={item.photo.avif.map(v => `${v.src} ${v.width}w`).join(', ')} sizes="190px" />}
      <img src={item.photo.preview[0].src} srcSet={item.photo.preview.map(v => `${v.src} ${v.width}w`).join(', ')} sizes="190px"
        width={item.photo.width} height={item.photo.height} alt={decorative ? '' : item.photo.alt} loading="lazy" decoding="async" draggable={false}
        style={{ objectPosition: item.position || 'center' }} />
    </picture>
  </motion.button>;
}

export default HaloReel;
