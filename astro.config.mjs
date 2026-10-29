import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import { loadEnv } from 'vite';

const contactEnv = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), 'CONTACT_');
const contactOrigins = (process.env.CONTACT_ALLOWED_ORIGINS || contactEnv.CONTACT_ALLOWED_ORIGINS || '')
  .split(',').map(origin => origin.trim()).filter(Boolean);

export default defineConfig({
  integrations: [react()],
  adapter: node({ mode: 'standalone' }),
  security: {
    allowedDomains: [
      { hostname: '127.0.0.1' }, { hostname: 'localhost' },
      ...contactOrigins.map(origin => {
        const url = new URL(origin);
        return { hostname: url.hostname, protocol: url.protocol.slice(0, -1), port: url.port };
      }),
    ],
  },
  devToolbar: { enabled: false },
});
