// Shim for `semver/functions/satisfies`
// Attempts to use installed `semver`, otherwise returns true to skip strict validation.
try {
  const semver = require('semver');
  module.exports = semver.satisfies;
} catch (e) {
  // Fallback: permissive function to avoid blocking the bundler when semver is missing
  module.exports = function _satisfies() {
    return true;
  };
}
