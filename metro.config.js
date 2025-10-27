const { getDefaultConfig } = require('expo/metro-config');

const path = require('path');
const config = getDefaultConfig(__dirname);

// Exclude TypeScript files in supabase/functions from bundling
config.resolver.blockList = [
  /supabase\/functions\/.*/,
  /functions\/.*/,
];

// Provide shims for semver subpath imports used by react-native-reanimated
// This maps imports like 'semver/functions/satisfies' to local shim files included in the repo
config.resolver.extraNodeModules = config.resolver.extraNodeModules || {};
config.resolver.extraNodeModules['semver/functions/satisfies'] = path.resolve(__dirname, 'shims/semver/functions/satisfies.js');
config.resolver.extraNodeModules['semver/functions/prerelease'] = path.resolve(__dirname, 'shims/semver/functions/prerelease.js');

module.exports = config;
