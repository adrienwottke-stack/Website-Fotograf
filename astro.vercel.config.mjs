import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import base from './astro.config.mjs';

const deploymentHosts = ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL']
  .map(key => process.env[key]).filter(Boolean)
  .map(hostname => ({ hostname, protocol: 'https' }));

// Separate build output keeps the local Node preview available during deployment.
export default defineConfig({
  ...base,
  adapter: vercel(),
  security: {
    ...base.security,
    allowedDomains: [...(base.security?.allowedDomains || []), ...deploymentHosts],
  },
  cacheDir: './.cache/vercel-astro/',
  outDir: './.cache/vercel-build/',
});
