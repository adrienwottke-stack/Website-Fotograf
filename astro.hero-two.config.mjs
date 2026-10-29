import { defineConfig } from 'astro/config';
import base from './astro.config.mjs';

// Keep this variant's build/cache separate from the previews used by other chats.
export default defineConfig({
  ...base,
  cacheDir: './.cache/hero-two/astro/',
  outDir: './.cache/hero-two/dist/',
  vite: {
    ...base.vite,
    define: {
      ...base.vite?.define,
      'import.meta.env.PUBLIC_BILDRAUM_PREVIEW': JSON.stringify('true'),
    },
  },
});
