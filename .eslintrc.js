module.exports = {
  extends: 'standard',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'comma-dangle': [2, 'always-multiline'],
    'no-unused-vars': 1,
    // 'semi': [2, 'always'],
  },
}
