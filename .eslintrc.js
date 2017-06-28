module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jasmine": true
  },
  "plugins": ["react", "redux-saga"],
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "globals": {
    "atom": true,
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "comma-dangle": [
      "error",
      "only-multiline"
    ],
    "curly": [
      "warn",
      "all"
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-console": [
      "error",
      {"allow": ["warn", "error", "debug"]},
    ],
    "prefer-const": "error",
    "quotes": [
      "error",
      "single",
      "avoid-escape"
    ],
    "semi": [
      "error",
      "always"
    ],
    "sort-imports": [
      "warn",
      {
        "ignoreCase": false,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
      }
    ],
    "no-useless-escape": [
      "off"
    ]
  },
};
