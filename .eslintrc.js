module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  extends: ["eslint:recommended", "airbnb-base", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  rules: {
    "import/no-extraneous-dependencies": 0,
    "prettier/prettier": "error",
    "no-console": "off",
  },
  settings: {
    "import/resolver": {
      node: {
        moduleDirectory: ["node_modules"],
      },
    },
  },
};
