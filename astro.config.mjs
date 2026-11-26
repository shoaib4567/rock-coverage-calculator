// @ts-check
import { defineConfig } from 'astro/config';
import { LEGACY_ROUTES } from './src/lib/content-map.mjs';

export default defineConfig({
  site: 'https://rockcoveragecalculator.com',
  trailingSlash: 'never',
  redirects: LEGACY_ROUTES
});
