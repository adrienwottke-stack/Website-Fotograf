let disposeFilmSpace = () => {};
let filmMotionPaused = false;

function mountFilmSpace() {
  disposeFilmSpace();
  const section = document.querySelector<HTMLElement>('[data-film-space]');
  const toggle = section?.querySelector<HTMLButtonElement>('[data-film-motion]');
  if (!section || !toggle) return;

  const controller = new AbortController();
  const signal = controller.signal;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine)');
  let inView = false;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const moving = () => inView && !filmMotionPaused && !reduced.matches && !document.hidden
    && !section.querySelector('.film-showcase__object:focus-within')
    && !document.querySelector('dialog[open]');

  const render = () => {
    frame = 0;
    if (!moving()) return;
    const rect = section.getBoundingClientRect();
    const scrollY = pointer.matches ? Math.max(-36, Math.min(36, (innerHeight / 2 - rect.top - rect.height / 2) * .045)) : 0;
    section.style.setProperty('--film-pointer-x', `${pointer.matches ? pointerX : 0}px`);
    section.style.setProperty('--film-pointer-y', `${pointer.matches ? pointerY : 0}px`);
    section.style.setProperty('--film-scroll-y', `${scrollY}px`);
  };
  const schedule = () => { if (!frame && moving()) frame = requestAnimationFrame(render); };
  const update = () => {
    section.dataset.filmMoving = String(moving());
    toggle.hidden = reduced.matches;
    toggle.setAttribute('aria-pressed', String(filmMotionPaused));
    toggle.querySelector<HTMLElement>('[data-film-motion-label]')!.textContent = filmMotionPaused ? 'Bewegung fortsetzen' : 'Bewegung pausieren';
    toggle.querySelector<SVGElement>('[data-film-pause-icon]')!.toggleAttribute('hidden', filmMotionPaused);
    toggle.querySelector<SVGElement>('[data-film-resume-icon]')!.toggleAttribute('hidden', !filmMotionPaused);
    if (moving()) schedule();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; update(); }, { threshold: 0 });
  observer.observe(section);
  const dialogObserver = new MutationObserver(update);
  document.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));

  toggle.addEventListener('click', () => { filmMotionPaused = !filmMotionPaused; update(); }, { signal });
  section.addEventListener('pointermove', event => {
    if (!pointer.matches || !moving() || (event.target instanceof Element && event.target.closest('[data-film]'))) return;
    const rect = section.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - .5) * 48;
    pointerY = (event.clientY / innerHeight - .5) * 32;
    schedule();
  }, { signal, passive: true });
  section.addEventListener('pointerleave', () => { pointerX = pointerY = 0; schedule(); }, { signal });
  section.addEventListener('focusin', update, { signal });
  section.addEventListener('focusout', () => queueMicrotask(update), { signal });
  window.addEventListener('scroll', schedule, { signal, passive: true });
  document.addEventListener('visibilitychange', update, { signal });
  reduced.addEventListener('change', update, { signal });
  pointer.addEventListener('change', update, { signal });
  update();

  disposeFilmSpace = () => {
    controller.abort();
    observer.disconnect();
    dialogObserver.disconnect();
    cancelAnimationFrame(frame);
    section.dataset.filmMoving = 'false';
  };
}

mountFilmSpace();
document.addEventListener('astro:after-swap', mountFilmSpace);
document.addEventListener('astro:before-swap', () => disposeFilmSpace());
