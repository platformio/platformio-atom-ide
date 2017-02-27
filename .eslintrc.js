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
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["jsx"],
  "rules": {
    "jsx/uses-factory": ["warn", {"pragma": "etch"}],
    "jsx/factory-in-scope": ["warn", {"pragma": "etch"}],
    "jsx/mark-used-vars": "warn",

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
      2,
      { "SwitchCase": 1 }
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
  },
};
