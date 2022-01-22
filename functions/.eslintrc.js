module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "require-jsdoc": "off",
    "quotes": ["error", "double"],
  },
  parserOptions: {
    "ecmaVersion": 8,
  },
};
