const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude TypeScript files in supabase/functions from bundling
config.resolver.blockList = [
  /supabase\/functions\/.*/,
  /functions\/.*/,
];

module.exports = config;
