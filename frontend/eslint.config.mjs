import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

// eslint-config-next 16 publishes flat configs directly, so they are spread in
// rather than bridged through FlatCompat — the old eslintrc bridge throws on
// these (it tries to JSON-serialise a self-referential config object).
const asArray = (config) => (Array.isArray(config) ? config : [config]);

const eslintConfig = [
  ...asArray(nextCoreWebVitals),
  ...asArray(nextTypeScript),
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default eslintConfig;
