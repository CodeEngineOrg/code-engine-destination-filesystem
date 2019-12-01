"use strict";

const tmp = require("tmp");

// Gracefully cleanup temp files
tmp.setGracefulCleanup();

module.exports = createDir;

/**
 * Creates a temp directory.
 *
 * @returns {Promise<string>} - The directory path
 */
async function createDir () {
  return await new Promise((resolve, reject) =>
    tmp.dir({ prefix: "code-engine-", unsafeCleanup: true }, (e, p) => e ? reject(e) : resolve(p)));
}
