import type * as React from 'react';

export type StreamImage = {
  src: string; alt: string; width: number; height: number;
  href: string; theme: string; themeSlug: string;
  srcSet?: string; avifSrcSet?: string;
};

export type ImageStreamHeroProps = {
  images: StreamImage[];
  id?: string;
};

// Server rendered only. HeroStream.astro owns one interaction controller.
// No React hydration, timer, pointer-follow effect or media dialog.
export function ImageStreamHero({ images, id = 'hero-bildring' }: ImageStreamHeroProps) {
  const step = images.length ? 360 / images.length : 0;
  const maxRatio = Math.max(...images.map(image => image.width / image.height), 2 / 3);
  return <div id={id} className="hero-ring" data-hero-ring data-ring-total={images.length}
    style={{ '--ring-max-photo-ratio': maxRatio } as React.CSSProperties}
    role="region" aria-roledescription="Karussell" aria-label="Fotografische Themen" tabIndex={0}>
    <div className="hero-ring__projection">
      <div className="hero-ring__space">
        {images.map((image, index) => {
          const angle = step * index;
          const depth = Math.cos(angle * Math.PI / 180);
          const style = {
            '--ring-angle': `${angle}deg`,
            '--ring-counter-angle': `${-angle}deg`,
            '--ring-opacity': String(.45 + (depth + 1) * .275),
            '--ring-photo-ratio': image.width / image.height,
          } as React.CSSProperties;
          return <a key={`${image.themeSlug}-${index}`} href={image.href}
            className="hero-ring__card" data-ring-card data-ring-theme={image.theme}
            data-active={index === 0 ? '' : undefined} style={style}
            aria-label={`${image.theme}: ${image.alt}`}>
            <picture>
              {image.avifSrcSet && <source type="image/avif" srcSet={image.avifSrcSet}
                sizes={`(max-width: 700px) min(calc((100vw - 44px) * ${image.width / image.height / maxRatio}), ${416 * image.width / image.height}px), 200px`} />}
              <img src={image.src} srcSet={image.srcSet}
                sizes={`(max-width: 700px) min(calc((100vw - 44px) * ${image.width / image.height / maxRatio}), ${416 * image.width / image.height}px), 200px`}
                width={image.width} height={image.height} alt={image.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" draggable={false} />
            </picture>
          </a>;
        })}
      </div>
    </div>
  </div>;
}

export default ImageStreamHero;
