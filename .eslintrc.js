module.exports = {
  'env': {
    'browser': false,
    'es6': true,
    'node': true,
    'jasmine': true,
  },
  'globals': {
    'DOMParser': true,
    'ErrorEvent': true,
    'atom': true,
    'document': true,
    'localStorage': true,
    'navigator': true,
    'window': true,
  },
  'plugins': [
    'import',
    'jsx'
  ],
  'extends': [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaVersion': 6,
    'sourceType': 'module',
    'ecmaFeatures': {
      "jsx": true
    }
  },
  'settings': {
    'import/core-modules': [
      'atom',
      'shell'
    ]
  },
  'rules': {
    'jsx/uses-factory': ['warn', {'pragma': 'jsxDOM'}],
    'jsx/factory-in-scope': ['warn', {'pragma': 'jsxDOM'}],
    'jsx/mark-used-vars': 'warn',
    'comma-dangle': [
      'error',
      'only-multiline'
    ],
    'curly': [
      'warn',
      'all'
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'no-console': [
      'error',
      { 'allow': ['warn', 'error', 'info'] },
    ],
    'prefer-const': 'error',
    'quotes': [
      'error',
      'single',
      'avoid-escape'
    ],
    'semi': [
      'error',
      'always'
    ],
    'sort-imports': [
      'warn',
      {
        'ignoreCase': false,
        'ignoreMemberSort': false,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single']
      }
    ],
    'no-useless-escape': [
      'off'
    ],
    'no-empty': [2, { 'allowEmptyCatch': true }]
  },
};
