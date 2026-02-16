import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'scripts/**',
    'check_models.js',
    'debug_key.js',
    'find_model.js',
    'src/app/admin/treatments/page.tsx',
    'src/app/mypage/page.tsx',
    'src/app/result/page.tsx',
  ]),
]);

export default eslintConfig;

