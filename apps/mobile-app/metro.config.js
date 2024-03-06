const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const { makeMetroConfig } = require("@rnx-kit/metro-config");
const MetroSymlinksResolver = require("@rnx-kit/metro-resolver-symlinks");
const { merge } = require('lodash');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    path.resolve(__dirname, "../../node_modules"),
  ],
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = makeMetroConfig({
  resolver: {
    resolveRequest: MetroSymlinksResolver(),
  },
}, mergeConfig(defaultConfig, config));