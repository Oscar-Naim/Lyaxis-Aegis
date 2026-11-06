import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'api-src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['**/scratch/**', '**/node_modules/**', '**/dist/**'],
    environment: 'node'
  }
});
