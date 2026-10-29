import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { createContactHandler } from '../src/server/contact.mjs';

const origin = 'http://127.0.0.1:4321';
const valid = {
  name: 'Test Besucherin', email: 'besucherin@example.test', anliegen: 'Ein Film für unser Projekt',
  termin: 'Im November', ort: 'Dresden', nachricht: 'Hallo Sandro,\nich habe eine Idee mit Licht und Bewegung. Grüße!', website: '',
};
const request = (data = valid, extra = {}) => new Request(`${origin}/api/kontakt`, {
  method: 'POST', headers: { Origin: origin, Accept: 'application/json', 'Content-Type': 'application/json', ...extra },
  body: JSON.stringify(data),
});

async function smtpFixture(t, { rejectRecipient = false } = {}) {
  const messages = [];
  const server = new SMTPServer({
    secure: false, disabledCommands: ['STARTTLS'], hideSTARTTLS: true,
    onAuth(auth, session, callback) {
      callback(auth.username === 'local-test' && auth.password === 'local-test-only' ? null : new Error('Bad credentials'), { user: 'local-test' });
    },
    onRcptTo(address, session, callback) { callback(rejectRecipient ? Object.assign(new Error('Recipient rejected'), { responseCode: 550 }) : null); },
    onData(stream, session, callback) {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => { messages.push({ raw: Buffer.concat(chunks), envelope: session.envelope }); callback(); });
    },
    logger: false,
  });
  server.on('error', () => {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const env = {
    NODE_ENV: 'test', CONTACT_SMTP_LOCAL_TEST: 'true', SMTP_HOST: '127.0.0.1',
    SMTP_PORT: String(server.server.address().port), SMTP_USER: 'local-test', SMTP_PASS: 'local-test-only',
    SMTP_FROM_EMAIL: 'website@example.test', SMTP_FROM_NAME: 'Sandro Mondini Website', CONTACT_TO_EMAIL: 'sandro@example.test',
  };
  return { env, messages };
}

test('real SMTP: fixed recipient, verified sender, visitor Reply-To and all form content', async t => {
  const { env, messages } = await smtpFixture(t);
  const response = await createContactHandler()({ request: request({ ...valid, to: 'attacker@example.test', from: 'attacker@example.test' }), env });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(messages.length, 1);
  const mail = await simpleParser(messages[0].raw);
  assert.equal(mail.from.value[0].address, 'website@example.test');
  assert.equal(mail.to.value[0].address, 'sandro@example.test');
  assert.equal(mail.replyTo.value[0].address, valid.email);
  assert.equal(mail.subject, `Websiteanfrage: ${valid.anliegen}`);
  for (const value of [valid.name, valid.email, valid.termin, valid.ort, valid.nachricht]) assert.ok(mail.text.includes(value));
  assert.equal(mail.html, false);
});

test('without SMTP access: 503, never a success response', async () => {
  const response = await createContactHandler()({ request: request(), env: {}, recipient: 'sandro@example.test' });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
});

test('validation blocks empty fields, bad email, header injection and honeypot', async () => {
  for (const change of [{ name: '' }, { email: 'invalid' }, { email: 'test@example.test\r\nBcc: x@y.test' }, { anliegen: 'Test\nBcc: x@y.test' }, { nachricht: 'x'.repeat(2501) }, { website: 'bot.example' }]) {
    const response = await createContactHandler()({ request: request({ ...valid, ...change }), env: {} });
    assert.ok([400, 422].includes(response.status), JSON.stringify(change));
  }
});

test('cross-origin submission is rejected', async () => {
  const response = await createContactHandler()({ request: request(valid, { Origin: 'https://elsewhere.example' }), env: {} });
  assert.equal(response.status, 403);
});

test('oversized payload is rejected without relying on Content-Length', async () => {
  const response = await createContactHandler()({ request: request({ ...valid, nachricht: 'x'.repeat(40000) }), env: {} });
  assert.equal(response.status, 413);
});

test('concurrent retry of same request sends only one mail; changed payload conflicts', async t => {
  const { env, messages } = await smtpFixture(t);
  const handle = createContactHandler();
  const headers = { 'X-Request-ID': 'abcdefgh-1234-1234-1234-123456789abc' };
  const results = await Promise.all([1, 2].map(() => handle({ request: request(valid, headers), env })));
  assert.deepEqual(results.map(r => r.status), [200, 200]);
  assert.equal(messages.length, 1);
  const conflict = await handle({ request: request({ ...valid, ort: 'Berlin' }, headers), env });
  assert.equal(conflict.status, 409);
});

test('SMTP refusal is a failure and retry is not falsely cached as success', async t => {
  const { env, messages } = await smtpFixture(t, { rejectRecipient: true });
  const handle = createContactHandler();
  for (let i = 0; i < 2; i++) {
    const result = await handle({ request: request(valid, { 'X-Request-ID': 'abcdefgh-1234-1234-1234-123456789abc' }), env });
    assert.equal(result.status, 502);
    assert.equal((await result.json()).ok, false);
  }
  assert.equal(messages.length, 0);
});

test('five requests per client per 15 minutes, then retry after expiry', async t => {
  const { env, messages } = await smtpFixture(t);
  let time = 100;
  const handle = createContactHandler({ now: () => time });
  for (let i = 0; i < 5; i++) assert.equal((await handle({ request: request(), env, clientAddress: '192.0.2.1' })).status, 200);
  assert.equal((await handle({ request: request(), env, clientAddress: '192.0.2.1' })).status, 429);
  time += 15 * 60 * 1000 + 1;
  assert.equal((await handle({ request: request(), env, clientAddress: '192.0.2.1' })).status, 200);
  assert.equal(messages.length, 6);
});

test('HTML fallback accepts native form submission and has no user HTML reflection', async t => {
  const { env } = await smtpFixture(t);
  const native = new Request(`${origin}/api/kontakt`, { method: 'POST', headers: { Origin: origin, Accept: 'text/html' }, body: new URLSearchParams({ ...valid, name: '<script>test</script>' }) });
  const response = await createContactHandler()({ request: native, env });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.ok(!(await response.text()).includes('<script>test'));
});

test('insecure SMTP is unavailable outside the restricted local test environment', async () => {
  const response = await createContactHandler()({ request: request(), env: { CONTACT_SMTP_LOCAL_TEST: 'true', NODE_ENV: 'production', SMTP_HOST: '127.0.0.1', SMTP_PORT: '2525', SMTP_USER: 'x', SMTP_PASS: 'x', SMTP_FROM_EMAIL: 'website@example.test', CONTACT_TO_EMAIL: 'sandro@example.test' } });
  assert.equal(response.status, 503);
});
