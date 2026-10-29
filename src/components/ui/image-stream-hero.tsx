import * as React from 'react';
import './image-stream-hero.css';

// Adapted from the supplied ImageStreamHero. Server rendered in Astro;
// the corridor runs in CSS without a React hydration bundle.
export type CorridorPath = {
  perspective?: number; cardWidth?: number; cardHeight?: number;
  cardRadius?: number; birthHeight?: number; exitHeight?: number;
  railBirth?: number; railExit?: number; fan?: number;
  turnBirth?: number; turnExit?: number; stops?: number;
};
const PATH: Required<CorridorPath> = {
  perspective: 30, cardWidth: 18, cardHeight: 25, cardRadius: .4,
  birthHeight: 2.6, exitHeight: 46, railBirth: -11, railExit: 44,
  fan: 3.3, turnBirth: 6, turnExit: 28, stops: 24,
};

function transformAt(dir: 1 | -1, u: number, p: Required<CorridorPath>) {
    const scale = (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
    const z = p.perspective * (1 - 1 / scale);
    const rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
    const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
    return `translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)`;
}

function keyframes(dir: 1 | -1, name: string, p: Required<CorridorPath>) {
  return `@keyframes ${name}{${Array.from({ length: p.stops + 1 }, (_, s) =>
    `${(s / p.stops * 100).toFixed(2)}%{transform:${transformAt(dir, s / p.stops, p)}}`
  ).join('')}}`;
}

export type StreamImage = {
  src: string; alt: string; width: number; height: number;
  srcSet?: string; avifSrcSet?: string; position?: string;
};
export type ImageStreamHeroProps = React.ComponentProps<'div'> & {
  images: StreamImage[]; cards?: number; speed?: number; axis?: number;
  path?: CorridorPath;
};

export function ImageStreamHero({ images, cards = 9, speed = 24, axis = 54,
  path, className = '', children, style, ...props }: ImageStreamHeroProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = { ...PATH, ...path };
  const names = [`ish-r-${id}`, `ish-l-${id}`];
  const perRail = Math.max(cards, Math.ceil(images.length / 2));
  return <div {...props} data-stream-step={cards * 2} data-stream-images={JSON.stringify(images)} className={`image-stream ${className}`} style={{ containerType: 'inline-size', ...style }}>
    <style>{keyframes(1, names[0], p) + keyframes(-1, names[1], p)}</style>
    <div className="image-stream__projection"
      style={{ perspective: `${p.perspective}cqw`, perspectiveOrigin: `50% ${axis}%` }}>
      <div className="image-stream__space" tabIndex={0} role="region" aria-label="Sandros Bildauswahl, auf dem Handy horizontal durchblättern">
        {images.length > 0 && names.flatMap((name, side) => Array.from({ length: perRail }, (_, i) => {
          const imageIndex = (i + side * perRail) % images.length;
          const image = images[imageIndex];
          return <div key={`${name}-${i}`} data-stream-index={imageIndex} data-stream-dormant={i >= cards ? '' : undefined} className="image-stream__card" style={{
            left: '50%', top: `${axis}%`, width: `${p.cardWidth}cqw`, height: `${p.cardHeight}cqw`,
            marginLeft: `${-p.cardWidth / 2}cqw`, marginTop: `${-p.cardHeight / 2}cqw`,
            borderRadius: `${p.cardRadius}cqw`, animationName: name,
            animationDuration: `${speed}s`, animationDelay: `${-((i % cards) * speed) / cards}s`,
            // Keep the corridor spread when the site's reduced-motion rule
            // disables all animations (rather than merely pausing them).
            transform: transformAt(side === 0 ? 1 : -1, (i % cards) / cards, p),
          }}>
            <picture>
              {image.avifSrcSet && <source type="image/avif" srcSet={image.avifSrcSet} sizes="(max-width: 700px) 480px, 42vw" />}
              <img src={image.src} srcSet={image.srcSet} sizes="(max-width: 700px) 480px, 42vw"
                width={image.width} height={image.height} alt={image.alt} loading={i < cards ? 'eager' : 'lazy'}
                fetchPriority={side === 0 && i === 0 ? 'high' : 'auto'} decoding="async"
                style={{ objectPosition: image.position || '50% 50%' }} draggable={false} />
            </picture>
          </div>;
        }))}
      </div>
    </div>
    {children}
  </div>;
}

export default ImageStreamHero;
