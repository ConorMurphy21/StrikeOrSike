/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    parser: '@typescript-eslint/parser'
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error'],
    '@typescript-eslint/unbound-method': ['off'],
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/no-unsafe-assignment': ['off'],
    'vue/multi-word-component-names': ['off'],
    'prettier/prettier': 2
  },
  ignorePatterns: ['/*', '!/src']
};
