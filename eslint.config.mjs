import antfu from '@antfu/eslint-config';

export default antfu({
  typescript: {
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  stylistic: {
    semi: true,
  },
  rules: {
    'antfu/top-level-function': ['off'],
    'jsonc/sort-keys': ['off'],
  },
}, {
  files: ['**/*.ts'],
  rules: {
    'ts/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/return-await': ['error', 'always'],
  },
});
