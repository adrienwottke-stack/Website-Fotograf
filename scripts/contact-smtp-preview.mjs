// Lokaler Ende-zu-Ende-Test: nimmt Mail nur im eigenen Prozess entgegen.
// Keine Internet-Zustellung und keine Änderung der regulären SMTP-Konfiguration.
import { SMTPServer } from 'smtp-server';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, '.cache/contact-test');
await mkdir(output, { recursive: true });
let count = 0;
const server = new SMTPServer({
  secure: false, disabledCommands: ['STARTTLS'], hideSTARTTLS: true,
  onAuth(auth, session, callback) {
    callback(auth.username === 'local-test' && auth.password === 'local-test-only' ? null : new Error('Bad credentials'), { user: 'local-test' });
  },
  onRcptTo(address, session, callback) {
    callback(address.address === 'sandro@example.test' ? null : new Error('Test recipient only'));
  },
  onData(stream, session, callback) {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', async () => {
      try {
        await writeFile(join(output, 'latest.eml'), Buffer.concat(chunks));
        await writeFile(join(output, 'status.json'), JSON.stringify({ received: ++count, externalDelivery: false }));
        console.log(`Lokaler SMTP-Empfang: ${count} Nachricht(en). Keine externe Zustellung.`);
        callback();
      } catch (error) { callback(error); }
    });
  },
  logger: false,
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const child = spawn(process.execPath, ['dist/server/entry.mjs'], {
  cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  env: {
    ...process.env, NODE_ENV: 'test', HOST: '127.0.0.1', PORT: '4339',
    CONTACT_SMTP_LOCAL_TEST: 'true', SMTP_HOST: '127.0.0.1', SMTP_PORT: String(server.server.address().port),
    SMTP_USER: 'local-test', SMTP_PASS: 'local-test-only', SMTP_FROM_EMAIL: 'website@example.test',
    SMTP_FROM_NAME: 'Sandro Website – lokaler Test', CONTACT_TO_EMAIL: 'sandro@example.test',
    CONTACT_ALLOWED_ORIGINS: '',
  },
});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
console.log('SMTP-Testvorschau: http://127.0.0.1:4339/kontakt/ — beendet mit stop oder Strg+C.');
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  child.kill();
  server.close(() => process.exit(0));
}
process.stdin.setEncoding('utf8');
process.stdin.on('data', data => { if (data.trim() === 'stop') stop(); });
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', () => { if (!stopping) stop(); });
