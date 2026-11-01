import { defineConfig } from 'astro/config';

// Once the domain is final, add `site: 'https://...'` here: canonical and hreflang tags appear only when it is set.
export default defineConfig({
  trailingSlash: 'ignore',
});
