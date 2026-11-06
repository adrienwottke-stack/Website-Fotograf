export {};

type Choice = 'tone' | 'films' | 'story' | 'about';
type ReviewState = Record<Choice, string> & { expanded: boolean };
type Review = { enabled: boolean; state: ReviewState; initialized?: boolean };
declare global { interface Window { __mondiniReview?: Review } }
const defaults: ReviewState = { tone: 'light', films: 'three', story: 'portrait', about: 'portrait', expanded: false };
const keys: Choice[] = ['tone', 'films', 'story', 'about'];
const allowed: Record<Choice, string[]> = { tone: ['light', 'dark'], films: ['three', 'six'], story: ['portrait', 'camera'], about: ['portrait', 'camera', 'gimbal'] };
const review = window.__mondiniReview;
if (review && !review.initialized) {
  review.initialized = true;
  const apply = (root: HTMLElement) => {
    root.toggleAttribute('data-review-enabled', review.enabled);
    keys.forEach(key => root.setAttribute(`data-review-${key}`, review.enabled ? review.state[key] : defaults[key]));
  };
  const save = () => { try { sessionStorage.setItem('mondini-review-v1', JSON.stringify(review.state)); } catch {} };
  const sync = () => {
    apply(document.documentElement);
    const panel = document.querySelector<HTMLElement>('[data-review-controls]');
    if (!panel) return;
    panel.querySelector('[data-review-toggle]')?.setAttribute('aria-expanded', String(review.state.expanded));
    const symbol = panel.querySelector('[data-review-toggle] span');
    if (symbol) symbol.textContent = review.state.expanded ? '−' : '＋';
    const options = panel.querySelector<HTMLElement>('#review-options');
    if (options) options.hidden = !review.state.expanded;
    panel.querySelectorAll<HTMLSelectElement>('[data-review-choice]').forEach(select => { select.value = review.state[select.dataset.reviewChoice as Choice]; });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', review.enabled && review.state.tone === 'dark' ? '#171c1e' : '#FFFDF6');
  };
  // One delegated set of listeners survives body replacement without duplicates.
  document.addEventListener('change', event => {
    const select = event.target;
    if (!review.enabled || !(select instanceof HTMLSelectElement)) return;
    const key = select.dataset.reviewChoice as Choice;
    if (!keys.includes(key) || !allowed[key].includes(select.value)) return;
    review.state[key] = select.value;
    save(); sync();
    const status = document.querySelector('[data-review-status]');
    if (status) status.textContent = `${select.selectedOptions[0].textContent} ausgewählt.`;
  });
  const collapse = () => {
    review.state.expanded = false; save(); sync();
    document.querySelector<HTMLButtonElement>('[data-review-toggle]')?.focus({ preventScroll: true });
  };
  document.addEventListener('click', event => {
    if (!review.enabled || !(event.target instanceof Element)) return;
    if (event.target.closest('[data-review-toggle]')) { review.state.expanded = !review.state.expanded; save(); sync(); }
    if (event.target.closest('[data-review-minimize]')) collapse();
    if (event.target.closest('[data-review-reset]')) { review.state = { ...defaults, expanded: true }; save(); sync(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && review.state.expanded && (event.target as Element)?.closest('[data-review-controls]')) { event.preventDefault(); collapse(); }
  });
  document.addEventListener('astro:before-swap', event => {
    const incoming = (event as Event & { newDocument: Document }).newDocument;
    apply(incoming.documentElement);
  });
  document.addEventListener('astro:page-load', sync);
  sync();
}
