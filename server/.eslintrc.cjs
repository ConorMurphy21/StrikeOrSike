require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: {
    es2022: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended-type-checked', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
    tsconfigRootDir: '.'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/prefer-for-of': 2,
    '@typescript-eslint/consistent-type-imports': 2,
    'prettier/prettier': 2
  },
  ignorePatterns: ['/*', '!/src', '!/tests']
};
