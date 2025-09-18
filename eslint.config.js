import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';

const baseGlobals = {
  ...globals.browser,
  ...globals.node,
};

export default [
  {
    ignores: ['dist/**', 'build/**', '.svelte-kit/**'],
  },
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        parser: tseslint.parser,
      },
      globals: baseGlobals,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'svelte/no-at-html-tags': 'error',
    },
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        extraFileExtensions: ['.svelte'],
      },
      globals: baseGlobals,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.{js,ts,svelte}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
