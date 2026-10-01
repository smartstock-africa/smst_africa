export default [
  {
    files: ['dist/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals:{
        $: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        URLSearchParams: 'readonly',
        Notification: 'readonly',
        gettext: 'readonly'
      }
    },

    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'warn',
      'no-console': 'warn',
      'no-cond-assign': 'error',
      'no-unreachable': 'error',
      camelcase: 'error',
      curly: 'error',
      quotes: ['error', 'single'],
    },
  },
];
