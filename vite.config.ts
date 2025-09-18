import fs from 'node:fs';
import path from 'node:path';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

function resolveHost() {
  const value = process.env.VITE_DEV_HOST;

  if (!value || value.trim().length === 0 || value === 'false') {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'lan') {
    return '0.0.0.0';
  }

  return value;
}

function resolveHttps() {
  const enabled = process.env.VITE_DEV_HTTPS === 'true';

  if (!enabled) {
    return false;
  }

  const keyPath = process.env.VITE_DEV_HTTPS_KEY;
  const certPath = process.env.VITE_DEV_HTTPS_CERT;

  if (!keyPath || !certPath) {
    return true;
  }

  const keyResolved = path.resolve(keyPath);
  const certResolved = path.resolve(certPath);

  try {
    if (!fs.existsSync(keyResolved) || !fs.existsSync(certResolved)) {
      console.warn(
        '[vite] HTTPS is enabled but the provided key/cert paths do not exist. Falling back to a self-signed certificate.',
      );
      return true;
    }

    return {
      key: fs.readFileSync(keyResolved),
      cert: fs.readFileSync(certResolved),
    };
  } catch (error) {
    console.warn(
      '[vite] Failed to read HTTPS key/cert from VITE_DEV_HTTPS_KEY/VITE_DEV_HTTPS_CERT. Falling back to self-signed certificate.',
      error,
    );
    return true;
  }
}

const host = resolveHost();
const https = resolveHttps();

export default defineConfig({
  plugins: [svelte()],
  server: {
    host,
    https,
  },
  preview: {
    host,
    https,
  },
});
