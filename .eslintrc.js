module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jasmine": true
  },
  "extends": "eslint:recommended",
  "globals": {
    "atom": true,
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
  },
  "plugins": ["jsx"],
  "rules": {
    "jsx/uses-factory": [1, {"pragma": "etchDom"}],
    "jsx/factory-in-scope": [1, {"pragma": "etchDom"}],
    "jsx/mark-used-vars": 1,

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
      {"allow": ["warn", "error", "debug"]},
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
    "sort-imports": [
      1,
      {
        "ignoreCase": false,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
      }
    ],
  },
};
