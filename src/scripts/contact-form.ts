export function initContactForm(form: HTMLFormElement, signal: AbortSignal) {
  const button = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const label = button.querySelector<HTMLElement>('[data-submit-label]')!;
  const status = form.querySelector<HTMLElement>('#form-status')!;
  const heading = status.querySelector<HTMLElement>('h3')!;
  const message = status.querySelector<HTMLElement>('p')!;
  const project = new URL(location.href).searchParams.get('projekt');
  if (project) form.querySelector<HTMLInputElement>('[name="anliegen"]')!.value = project.slice(0, 150);
  let pending = false;
  let lastPayload = '';
  let requestId = crypto.randomUUID();

  const showStatus = (ok: boolean, text: string) => {
    status.hidden = false;
    status.dataset.state = ok ? 'success' : 'error';
    heading.textContent = ok ? 'Danke für deine Nachricht.' : 'Das hat noch nicht geklappt.';
    message.textContent = text;
    status.focus({ preventScroll: true });
    status.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const payload = JSON.stringify(Object.fromEntries(new FormData(form)));
    if (payload !== lastPayload) { requestId = crypto.randomUUID(); lastPayload = payload; }
    pending = true;
    button.disabled = true;
    label.textContent = 'Wird gesendet …';
    form.setAttribute('aria-busy', 'true');
    status.hidden = true;
    try {
      const result = await fetch(form.action, {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Request-ID': requestId },
        body: payload,
      });
      const data = await result.json();
      const ok = result.ok && data.ok === true;
      showStatus(ok, typeof data.message === 'string' ? data.message : 'Die Nachricht konnte gerade nicht gesendet werden. Bitte versuche es erneut.');
      if (ok) { form.reset(); lastPayload = ''; }
    } catch {
      if (!signal.aborted) showStatus(false, 'Der Versand konnte nicht bestätigt werden. Deine Eingaben bleiben erhalten. Prüfe deine Verbindung und versuche es erneut.');
    } finally {
      pending = false;
      button.disabled = false;
      label.textContent = 'Nachricht senden';
      form.removeAttribute('aria-busy');
    }
  }, { signal });
}
