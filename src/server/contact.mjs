import { createHash, randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_BODY_BYTES = 32 * 1024;
const singleLine = /^[^\u0000-\u001f\u007f]*$/u;
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;
const hash = value => createHash('sha256').update(value).digest('hex');

class FormError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function readForm(request) {
  const type = request.headers.get('content-type')?.split(';')[0];
  if (!['application/json', 'application/x-www-form-urlencoded'].includes(type)) {
    throw new FormError(415, 'Bitte sende die Anfrage über das Kontaktformular.');
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    throw new FormError(413, 'Die Nachricht ist zu lang. Bitte kürze deinen Text.');
  }
  const reader = request.body?.getReader();
  const chunks = [];
  let size = 0;
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new FormError(413, 'Die Nachricht ist zu lang. Bitte kürze deinen Text.');
      }
      chunks.push(value);
    }
  }
  const text = Buffer.concat(chunks).toString('utf8');
  try {
    const data = type === 'application/json' ? JSON.parse(text) : Object.fromEntries(new URLSearchParams(text));
    if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error();
    return data;
  } catch {
    throw new FormError(400, 'Die Anfrage konnte nicht gelesen werden. Bitte versuche es erneut.');
  }
}

function validate(data) {
  const fields = {};
  for (const [name, max, required] of [
    ['name', 100, true], ['email', 254, true], ['anliegen', 150, true],
    ['termin', 100, false], ['ort', 100, false], ['nachricht', 2500, true], ['website', 200, false],
  ]) {
    const value = data[name] ?? '';
    if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
      throw new FormError(422, 'Bitte prüfe die Pflichtfelder und die Länge deiner Nachricht.');
    }
    fields[name] = value.trim();
    if (name !== 'nachricht' && !singleLine.test(fields[name])) {
      throw new FormError(422, 'Bitte verwende in den kurzen Feldern keine Zeilenumbrüche.');
    }
  }
  if (!emailPattern.test(fields.email)) throw new FormError(422, 'Bitte gib eine gültige E-Mail-Adresse ein.');
  if (fields.website) throw new FormError(400, 'Die Anfrage konnte nicht gesendet werden.');
  return fields;
}

function mailConfig(env, defaultRecipient) {
  const host = env.SMTP_HOST?.trim();
  const port = Number(env.SMTP_PORT || 587);
  const from = env.SMTP_FROM_EMAIL?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim() || defaultRecipient;
  // Unverschlüsseltes SMTP ausschließlich für den lokalen Testempfänger.
  const localTest = env.CONTACT_SMTP_LOCAL_TEST === 'true' &&
    ['127.0.0.1', '::1'].includes(host) && env.NODE_ENV !== 'production' && to?.endsWith('@example.test');
  if (!host || !from || !emailPattern.test(from) || !to || !emailPattern.test(to) ||
      !singleLine.test(from) || !singleLine.test(to) ||
      !env.SMTP_USER || !env.SMTP_PASS || !Number.isInteger(port) ||
      (localTest ? port < 1 || port > 65535 : ![465, 587].includes(port))) {
    throw new FormError(503, 'Der Formularversand ist noch nicht eingerichtet. Bitte nutze vorerst die E-Mail-Adresse neben dem Formular.');
  }
  return { host, port, from, to, localTest };
}

function response(request, status, message) {
  const ok = status === 200;
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (status === 429) headers['Retry-After'] = '900';
  if (request.headers.get('accept')?.includes('application/json')) {
    return Response.json({ ok, message }, { status, headers });
  }
  // Die Texte sind feste Servermeldungen, keine reflektierten Formulareingaben.
  headers['Content-Type'] = 'text/html; charset=utf-8';
  headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'";
  return new Response(`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${ok ? 'Anfrage gesendet' : 'Anfrage nicht gesendet'}</title><style>body{font:18px/1.6 system-ui;background:#f8f6ed;color:#242622;max-width:42rem;margin:10vh auto;padding:24px}a{color:inherit}</style><h1>${ok ? 'Danke für deine Nachricht.' : 'Das hat noch nicht geklappt.'}</h1><p>${message}</p><p><a href="/kontakt/">Zurück zum Kontaktformular</a></p></html>`, { status, headers });
}

/** One handler instance per Node process; stores only temporary hashes and status. */
export function createContactHandler({ now = Date.now } = {}) {
  const attempts = new Map();
  const submissions = new Map();
  const prune = (map, time) => {
    for (const [key, item] of map) if (item.expires <= time) map.delete(key);
  };
  const remember = (map, key, item) => {
    const previous = map.get(key);
    map.set(key, item);
    if (previous !== item) {
      const timer = setTimeout(() => { if (map.get(key) === item) map.delete(key); }, Math.max(0, item.expires - now()));
      timer.unref();
    }
  };
  return async function handleContact({ request, clientAddress = 'unknown', env = process.env, recipient }) {
    try {
      if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
      const ownOrigin = new URL(request.url).origin;
      const allowedOrigins = [ownOrigin, ...(env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean)];
      const origin = request.headers.get('origin');
      if (!origin || !allowedOrigins.includes(origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
        throw new FormError(403, 'Bitte sende deine Anfrage direkt über diese Website.');
      }
      const data = validate(await readForm(request));
      const config = mailConfig(env, recipient);
      const time = now();
      prune(attempts, time);
      prune(submissions, time);
      const clientKey = hash(clientAddress);
      const requestId = request.headers.get('x-request-id') || randomUUID();
      if (!/^[a-z0-9-]{16,80}$/i.test(requestId)) throw new FormError(400, 'Bitte lade das Formular erneut.');
      const submissionKey = hash(`${clientKey}:${requestId}`);
      const fingerprint = hash(JSON.stringify(data));
      const previous = submissions.get(submissionKey);
      if (previous) {
        if (previous.fingerprint !== fingerprint) throw new FormError(409, 'Bitte versuche es erneut.');
        await previous.promise;
        return response(request, 200, 'Deine Nachricht wurde an den Mailserver übergeben. Sandro kann dir über deine E-Mail-Adresse antworten.');
      }
      const attempt = attempts.get(clientKey) || { count: 0, expires: time + WINDOW_MS };
      if (attempt.count >= 5 || attempts.size >= 5000 || submissions.size >= 5000) {
        throw new FormError(429, 'Zu viele Anfragen in kurzer Zeit. Bitte versuche es in 15 Minuten erneut.');
      }
      attempt.count += 1;
      remember(attempts, clientKey, attempt);
      const send = async () => {
        const transport = nodemailer.createTransport({
          host: config.host, port: config.port, secure: config.port === 465,
          requireTLS: !config.localTest && config.port !== 465,
          ignoreTLS: config.localTest,
          auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
          connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
          disableFileAccess: true, disableUrlAccess: true,
        });
        try {
          const info = await transport.sendMail({
            from: { name: singleLine.test(env.SMTP_FROM_NAME || '') ? env.SMTP_FROM_NAME || 'Sandro Mondini Website' : 'Sandro Mondini Website', address: config.from },
            to: { address: config.to },
            replyTo: { name: data.name, address: data.email },
            subject: `Websiteanfrage: ${data.anliegen}`,
            text: [
              'Neue Anfrage über die Website', '', `Name: ${data.name}`, `E-Mail: ${data.email}`,
              `Anliegen: ${data.anliegen}`, `Termin: ${data.termin || 'Noch offen'}`,
              `Ort: ${data.ort || 'Noch offen'}`, '', data.nachricht,
            ].join('\n'),
          });
          if (!info.accepted?.some(address => address.toLowerCase() === config.to.toLowerCase())) {
            throw new Error('SMTP_RECIPIENT_NOT_ACCEPTED');
          }
        } finally { transport.close(); }
      };
      const promise = send();
      remember(submissions, submissionKey, { promise, fingerprint, expires: time + WINDOW_MS });
      try { await promise; } catch {
        submissions.delete(submissionKey);
        throw new FormError(502, 'Die Nachricht konnte gerade nicht gesendet werden. Deine Eingaben bleiben erhalten. Bitte versuche es erneut oder nutze die E-Mail-Adresse neben dem Formular.');
      }
      return response(request, 200, 'Deine Nachricht wurde an den Mailserver übergeben. Sandro kann dir über deine E-Mail-Adresse antworten.');
    } catch (error) {
      const known = error instanceof FormError;
      return response(request, known ? error.status : 502, known ? error.message : 'Die Nachricht konnte gerade nicht gesendet werden. Bitte versuche es erneut.');
    }
  };
}
