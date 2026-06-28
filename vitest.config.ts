import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables from env files
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  return {
    test: {
      environment: 'node',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
