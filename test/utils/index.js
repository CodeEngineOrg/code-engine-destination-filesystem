"use strict";

const tmp = require("tmp");
const readdir = require("readdir-enhanced");

// Gracefully cleanup temp files
tmp.setGracefulCleanup();

module.exports = {
  /**
   * Creates a temp directory.
   *
   * @returns {Promise<string>} - The directory path
   */
  async createDir () {
    return await new Promise((resolve, reject) =>
      tmp.dir({ prefix: "code-engine-", unsafeCleanup: true }, (e, p) => e ? reject(e) : resolve(p)));
  },


  /**
   * Reads all files in a directory (including sub-directories)
   */
  async readDir (path) {
    let entries = await readdir(path, { deep: true, stats: true });

    let files = entries
      .filter((entry) => entry.isFile())
      .map((file) => file.path);

    return files;
  },
};
