module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
  },
  "extends": "eslint:recommended",
  "globals": {
    "atom": true,
  },
  "parserOptions": {
    "sourceType": "module",
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
    "indent": [
      "warn",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-console": [
      "error",
      {"allow": ["warn", "error"]},
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
  },
};
