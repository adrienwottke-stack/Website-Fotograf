import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { contactEmail } from '../../data/portfolio';
import { createContactHandler } from '../../server/contact.mjs';

export const prerender = false;
const handleContact = createContactHandler();
const keys = [
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL', 'SMTP_FROM_NAME',
  'CONTACT_TO_EMAIL', 'CONTACT_ALLOWED_ORIGINS', 'CONTACT_SMTP_LOCAL_TEST', 'NODE_ENV',
];

export const POST: APIRoute = context => handleContact({
  request: context.request,
  clientAddress: context.clientAddress,
  recipient: contactEmail,
  env: Object.fromEntries(keys.map(key => [key, getSecret(key)])),
});
