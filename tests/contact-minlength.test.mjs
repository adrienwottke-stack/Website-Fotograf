import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactHandler } from '../src/server/contact.mjs';

// Empty configuration guarantees that accepted validation stops before transport creation.
for (const [label, nachricht, expected] of [
  ['29 trimmed characters', 'a'.repeat(29), 422],
  ['padding cannot make 29 characters sufficient', `  ${'a'.repeat(29)} \n`, 422],
  ['whitespace only', ' \t\n'.repeat(15), 422],
  ['30 trimmed characters', 'a'.repeat(30), 503],
  ['30 characters with padding', `  ${'a'.repeat(30)} \n`, 503],
  ['2500 characters', 'a'.repeat(2500), 503],
  ['2501 characters', 'a'.repeat(2501), 422],
]) {
  test(label, async () => {
    const request = new Request('http://localhost/api/kontakt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: 'http://localhost' },
      body: JSON.stringify({ name: 'Local validation', email: 'validation@example.test', anliegen: 'Validation', nachricht }),
    });
    const response = await createContactHandler()({ request, env: {}, recipient: 'recipient@example.test' });
    assert.equal(response.status, expected);
    const result = await response.json();
    assert.equal(result.ok, false);
    if (expected === 503) assert.match(result.message, /noch nicht eingerichtet/);
    if (label.includes('29')) assert.match(result.message, /mindestens 30 Zeichen/);
  });
}
