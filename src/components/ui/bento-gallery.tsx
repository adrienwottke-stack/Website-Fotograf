'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import type { Photo } from '../../data/portfolio';
import './bento-gallery.css';

export interface ImageItem { id: string; title: string; desc: string; href: string; photo: Photo; position?: string }
interface Props { imageItems: ImageItem[] }

function ImageView({ item, full = false, index = 0 }: { item: ImageItem; full?: boolean; index?: number }) {
  const variants = full ? item.photo.display : item.photo.preview;
  const sizes = full ? '(max-width: 700px) 92vw, 80vw' : index === 0 || index === 6 ? '(max-width: 600px) 420px, 50vw' : '(max-width: 600px) 210px, 25vw';
  return <picture className="bento4-photo">
    {!full && !!item.photo.avif?.length && <source type="image/avif" srcSet={item.photo.avif.map(v => `${v.src} ${v.width}w`).join(', ')} sizes={sizes} />}
    <img src={full ? item.photo.large.src : variants[0].src} srcSet={variants.map(v => `${v.src} ${v.width}w`).join(', ')} sizes={sizes}
      width={item.photo.width} height={item.photo.height} alt={item.photo.alt} loading={full ? 'eager' : 'lazy'} decoding="async" draggable={false}
      style={{ objectPosition: full ? 'center' : item.position || 'center' }} />
  </picture>;
}

/** The supplied draggable horizontal bento: unequal tiles, hover captions and
 * image preview, using responsive portfolio media and a native modal dialog. */
export default function InteractiveImageBentoGallery({ imageItems }: Props) {
  const root = useRef<HTMLDivElement>(null), viewport = useRef<HTMLDivElement>(null), grid = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null), opener = useRef<HTMLButtonElement | null>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const reduced = !!useReducedMotion();
  const [leftBound, setLeftBound] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<ImageItem | null>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const progress = useTransform(x, [0, leftBound || -1], [0, 1]);
  const moveTo = (value: number) => {
    animation.current?.stop();
    animation.current = animate(x, Math.max(leftBound, Math.min(0, value)), reduced ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 28 });
  };
  const move = (direction: number) => moveTo(x.get() - direction * (viewport.current?.clientWidth || 400) * .72);

  useMotionValueEvent(x, 'change', value => {
    const start = value >= -.5, end = value <= leftBound + .5;
    setEdges(previous => previous.start === start && previous.end === end ? previous : { start, end });
  });

  useEffect(() => {
    const element = root.current!, view = viewport.current!, content = grid.current!;
    const panel = element.closest<HTMLElement>('[data-theme-panel]');
    const resize = () => {
      if (!view.clientWidth) return;
      const bound = Math.min(0, view.clientWidth - content.scrollWidth);
      setLeftBound(bound); x.set(Math.max(bound, Math.min(0, x.get())));
      setEdges({ start: x.get() >= -.5, end: x.get() <= bound + .5 }); element.dataset.ready = 'true';
    };
    const observer = new ResizeObserver(resize); observer.observe(view); observer.observe(content);
    const optionObserver = new MutationObserver(() => { animation.current?.stop(); resize(); });
    if (panel) optionObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    const suspend = () => { if (document.hidden) animation.current?.stop(); };
    const leave = () => { animation.current?.stop(); dialog.current?.close(); };
    document.addEventListener('visibilitychange', suspend); document.addEventListener('astro:before-swap', leave);
    resize();
    return () => { observer.disconnect(); optionObserver.disconnect(); animation.current?.stop(); document.removeEventListener('visibilitychange', suspend); document.removeEventListener('astro:before-swap', leave); };
  }, [imageItems, x]);

  useEffect(() => {
    const element = dialog.current!;
    if (selected && !element.open) element.showModal();
    if (!selected && element.open) { element.close(); opener.current?.focus({ preventScroll: true }); }
  }, [selected]);

  return <div ref={root} className={`bento4${dragging ? ' bento4--dragging' : ''}`} data-bento-four
    role="region" aria-label="Themenwelten als verschiebbare Bildcollage" tabIndex={0}
    onKeyDown={event => {
      if ((event.target as HTMLElement).closest('dialog')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); moveTo(event.key === 'Home' ? 0 : leftBound); }
    }}>
    <div ref={viewport} className="bento4-window">
      <motion.div className="bento4-strip" style={{ x }} drag="x" dragConstraints={{ left: leftBound, right: 0 }}
        dragElastic={.05} dragMomentum={!reduced} onPointerDownCapture={() => { dragged.current = false; }}
        onDragStart={() => { dragged.current = true; setDragging(true); }} onDragEnd={() => setDragging(false)}>
        <div ref={grid} className="bento4-grid">
          {imageItems.map((item, index) => <motion.button key={item.id} type="button" data-bento-four-card={item.id}
            className={`bento4-card bento4-card--${index}`} aria-label={`${item.title}: Großansicht öffnen`}
            whileHover={reduced ? {} : { scale: 1.015 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={event => { if (event.detail === 0 || !dragged.current) { opener.current = event.currentTarget; setSelected(item); } }}
            onFocus={event => {
              const element = event.currentTarget, view = viewport.current!;
              const left = element.offsetLeft + x.get(), right = left + element.offsetWidth;
              if (left < 0) moveTo(x.get() - left);
              else if (right > view.clientWidth) moveTo(x.get() - (right - view.clientWidth));
              requestAnimationFrame(() => { view.scrollLeft = 0; });
            }}>
            <ImageView item={item} index={index} />
            <span className="bento4-caption"><span className="bento4-title">{item.title}</span><span className="bento4-desc">{item.desc}</span></span>
            <span className="bento4-open" aria-hidden="true"><ArrowUpRight size={23} /></span>
          </motion.button>)}
        </div>
      </motion.div>
    </div>
    <div className="bento4-controls"><p>Ziehen und entdecken.</p><div className="bento4-progress" aria-hidden="true"><motion.span style={{ scaleX: progress }} /></div>
      <div className="bento4-arrows"><button type="button" aria-label="Bildcollage zurück" disabled={edges.start} onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button><button type="button" aria-label="Bildcollage weiter" disabled={edges.end} onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button></div>
    </div>
    <dialog ref={dialog} className="bento4-modal" aria-label="Großansicht der Bildcollage"
      onCancel={event => { event.preventDefault(); setSelected(null); }} onClose={() => { setSelected(null); opener.current?.focus({ preventScroll: true }); }}
      onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}>
      {selected && <>
        <motion.figure className="bento4-modal__figure" initial={reduced ? false : { scale: .96, y: 12 }} animate={{ scale: 1, y: 0 }} transition={{ duration: reduced ? 0 : .2 }}>
          <ImageView item={selected} full />
          <figcaption><div><h3>{selected.title}</h3><p>{selected.desc}</p></div><a href={selected.href}>{selected.title} entdecken <ArrowUpRight size={18} aria-hidden="true" /></a></figcaption>
        </motion.figure>
        <button type="button" className="bento4-modal__close" aria-label="Großansicht schließen" autoFocus onClick={() => setSelected(null)}><X aria-hidden="true" /></button>
      </>}
    </dialog>
  </div>;
}
