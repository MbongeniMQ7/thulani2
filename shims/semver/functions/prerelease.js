// Shim for `semver/functions/prerelease`
// Attempts to use installed `semver`, otherwise returns null so prerelease checks don't fail.
try {
  const semver = require('semver');
  module.exports = semver.prerelease;
} catch (e) {
  // Fallback: return null (no prerelease) to avoid blocking the bundler when semver is missing
  module.exports = function _prerelease() {
    return null;
  };
}
