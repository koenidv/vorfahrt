module.exports = {
  presets: ["@rnx-kit/babel-preset-metro-react-native"],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
