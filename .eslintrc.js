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
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
  },
  "rules": {
    "comma-dangle": [
      2,
      "only-multiline"
    ],
    "curly": [
      1,
      "all"
    ],
    "indent": [
      1,
      2
    ],
    "linebreak-style": [
      2,
      "unix"
    ],
    "no-console": [
      2,
      {"allow": ["warn", "error"]},
    ],
    "prefer-const": 2,
    "quotes": [
      2,
      "single",
      "avoid-escape"
    ],
    "semi": [
      2,
      "always"
    ],
  },
};
