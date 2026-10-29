'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useDragControls, useMotionValue, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Grip, GripHorizontal, RotateCcw, X } from 'lucide-react';
import type { Photo } from '../../data/portfolio';
import './interactive-bento-gallery.css';

export interface MediaItemType {
  id: string; title: string; desc: string; href: string; photo: Photo; position?: string;
}
interface Props { mediaItems: MediaItemType[] }
const areas = ['people', 'cars', 'events', 'wedding', 'meet', 'animals', 'travel'];

function MediaItem({ item, full = false, previewSizes }: { item: MediaItemType; full?: boolean; previewSizes?: string }) {
  const variants = full ? item.photo.display : item.photo.preview;
  const sizes = full ? '(max-width: 700px) 92vw, 78vw' : previewSizes || '46vw';
  return <picture className="bento-photo">
    {!full && !!item.photo.avif?.length && <source type="image/avif" srcSet={item.photo.avif.map(v => `${v.src} ${v.width}w`).join(', ')} sizes={sizes} />}
    <img src={full ? item.photo.large.src : variants[0].src}
      srcSet={variants.map(v => `${v.src} ${v.width}w`).join(', ')} sizes={sizes}
      width={item.photo.width} height={item.photo.height} alt={item.photo.alt}
      loading={full ? 'eager' : 'lazy'} decoding="async" draggable={false}
      style={{ objectPosition: full ? 'center' : item.position || 'center' }} />
  </picture>;
}

function BentoCard({ item, index, reduced, open, move }: {
  item: MediaItemType; index: number; reduced: boolean; open: (item: MediaItemType, trigger: HTMLButtonElement) => void;
  move: (id: string, destination: number) => void;
}) {
  const controls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    move(item.id, index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1));
  };
  return <motion.div ref={ref} layout={!reduced} data-bento-id={item.id} className="bento-card"
    style={{ gridArea: areas[index] }} drag dragControls={controls} dragListener={false}
    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} dragElastic={.5}
    whileDrag={{ zIndex: 5, scale: reduced ? 1 : 1.025 }}
    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
    onDragEnd={(event, info) => {
      if (Math.hypot(info.offset.x, info.offset.y) < 40) return;
      const pointer = event as PointerEvent;
      const grid = ref.current?.closest('.bento-grid');
      const targets = [...(grid?.querySelectorAll<HTMLElement>('[data-bento-id]') || [])];
      const target = targets.map((element, destination) => {
        const rect = element.getBoundingClientRect();
        return { destination, distance: element === ref.current ? Infinity : Math.hypot(pointer.clientX - (rect.left + rect.width / 2), pointer.clientY - (rect.top + rect.height / 2)) };
      }).sort((a, b) => a.distance - b.distance)[0];
      if (target) move(item.id, target.destination);
    }}>
    <button type="button" className="bento-card__open" onClick={event => open(item, event.currentTarget)} aria-label={`${item.title}: Bild ansehen`}>
      <MediaItem item={item} previewSizes={`(max-width: 900px) ${index === 6 ? '90vw' : '45vw'}, ${[1,3,6].includes(index) ? '46vw' : '23vw'}`} />
      <span className="bento-card__caption"><span className="bento-card__title">{item.title}</span><span className="bento-card__desc">{item.desc}</span></span>
      <span className="bento-card__expand" aria-hidden="true"><ArrowUpRight size={20} /></span>
    </button>
    <button type="button" className="bento-card__grip" aria-label={`${item.title} verschieben. Pfeiltasten ändern die Reihenfolge.`}
      title="Ziehen oder mit Pfeiltasten verschieben" onPointerDown={event => controls.start(event)} onKeyDown={keyboard}>
      <Grip size={18} aria-hidden="true" />
    </button>
  </motion.div>;
}

/** Adapted from the supplied draggable bento gallery, using the site's
 * responsive exports, a native dialog and links to the existing theme galleries. */
export default function InteractiveBentoGallery({ mediaItems }: Props) {
  const [items, setItems] = useState(mediaItems);
  const [selected, setSelected] = useState<MediaItemType | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const reduced = !!useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const dockControls = useDragControls();
  const dockX = useMotionValue(0), dockY = useMotionValue(0);

  useEffect(() => {
    const element = dialog.current!;
    if (selected && !element.open) {
      element.showModal();
    } else if (!selected && element.open) {
      element.close(); opener.current?.focus({ preventScroll: true });
      dockX.set(0); dockY.set(0);
    }
  }, [selected, dockX, dockY]);

  useEffect(() => {
    const close = () => { dialog.current?.close(); setSelected(null); };
    const section = dialog.current?.closest('[data-theme-showcase]');
    document.addEventListener('astro:before-swap', close);
    section?.addEventListener('theme:change', close);
    return () => { document.removeEventListener('astro:before-swap', close); section?.removeEventListener('theme:change', close); };
  }, []);

  const move = (id: string, destination: number) => {
    const from = items.findIndex(item => item.id === id);
    const to = Math.max(0, Math.min(destination, items.length - 1));
    if (from < 0 || from === to) return;
    const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item);
    setItems(next); setAnnouncement(`${item.title} an Position ${to + 1} von ${items.length}.`);
  };
  const open = (item: MediaItemType, trigger: HTMLButtonElement) => {
    opener.current = trigger; setSelected(item);
  };
  const advance = (direction: number) => {
    const index = items.findIndex(item => item.id === selected?.id);
    setSelected(items[(index + direction + items.length) % items.length]);
  };

  return <div className="interactive-bento">
    <div className="bento-grid" aria-label="Sieben fotografische Themenwelten">
      {items.map((item, index) => <BentoCard key={item.id} item={item} index={index} reduced={reduced} open={open} move={move} />)}
    </div>
    <p className="bento-sr-only" role="status">{announcement}</p>
    <dialog ref={dialog} className="bento-dialog" aria-label="Bildvorschau der Themenwelten"
      onCancel={event => { event.preventDefault(); setSelected(null); }} onClose={() => { setSelected(null); opener.current?.focus({ preventScroll: true }); }}
      onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}
      onKeyDown={event => {
        if ((event.target as HTMLElement).closest('.bento-dock')) return;
        if (event.key === 'ArrowLeft') { event.preventDefault(); advance(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); advance(1); }
      }}>
      {selected && <>
        <header className="bento-dialog__heading">
          <div><h3>{selected.title}</h3><p>{selected.desc}</p></div>
          <button type="button" className="bento-icon" aria-label="Bildvorschau schließen" onClick={() => setSelected(null)} autoFocus><X aria-hidden="true" /></button>
        </header>
        <div className="bento-dialog__stage">
          <button type="button" className="bento-icon bento-dialog__prev" aria-label="Vorheriges Thema" onClick={() => advance(-1)}><ChevronLeft aria-hidden="true" /></button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={selected.id} className="bento-dialog__image" initial={{ scale: reduced ? 1 : .98 }}
              animate={{ scale: 1 }} exit={{ scale: reduced ? 1 : .98 }} transition={{ duration: reduced ? 0 : .16 }}>
              <MediaItem item={selected} full />
            </motion.div>
          </AnimatePresence>
          <button type="button" className="bento-icon bento-dialog__next" aria-label="Nächstes Thema" onClick={() => advance(1)}><ChevronRight aria-hidden="true" /></button>
        </div>
        <a className="bento-dialog__theme" href={selected.href}>{selected.title} entdecken <ArrowUpRight size={18} aria-hidden="true" /></a>
        <div className="bento-dock-wrap">
          <motion.div className="bento-dock" drag={!reduced} dragListener={false} dragControls={dockControls} dragMomentum={false}
            dragElastic={0} dragConstraints={dialog} style={{ x: dockX, y: dockY }}>
            <div className="bento-dock__tools">
              <button type="button" className="bento-dock__handle" aria-label="Bildleiste verschieben. Pfeiltasten bewegen die Leiste."
                onPointerDown={event => dockControls.start(event)} onKeyDown={event => {
                  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
                  event.preventDefault();
                  if(event.key === 'ArrowLeft') dockX.set(dockX.get() - 20);
                  if(event.key === 'ArrowRight') dockX.set(dockX.get() + 20);
                  if(event.key === 'ArrowUp') dockY.set(dockY.get() - 20);
                  if(event.key === 'ArrowDown') dockY.set(dockY.get() + 20);
                }}><GripHorizontal size={22} aria-hidden="true" /></button>
              <button type="button" aria-label="Position der Bildleiste zurücksetzen" onClick={() => { dockX.set(0); dockY.set(0); }}><RotateCcw size={15} aria-hidden="true" /></button>
            </div>
            <nav className="bento-dock__photos" aria-label="Thema in der Bildvorschau wählen">
              {items.map((item, index) => <motion.button key={item.id} type="button" aria-label={item.title}
                aria-pressed={item.id === selected.id} onClick={() => setSelected(item)}
                animate={reduced ? {} : { rotate: item.id === selected.id ? 0 : index % 2 ? 8 : -8, y: item.id === selected.id ? -5 : 0 }}
                whileHover={reduced ? {} : { rotate: 0, y: -7 }}>
                <img src={item.photo.preview[0].src} width="52" height="52" alt="" draggable={false} />
              </motion.button>)}
            </nav>
          </motion.div>
        </div>
      </>}
    </dialog>
  </div>;
}
