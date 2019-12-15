import { Plugin } from "@code-engine/types";
import { clean } from "./clean";
import { FileSystemConfig } from "./config";
import { normalizeConfig } from "./normalize-config";
import { processFile } from "./process-file";

/**
 * A CodeEngine plugin that writes files to the filesystem.
 */
function filesystem(conf?: FileSystemConfig): Plugin {
  let config = normalizeConfig(conf);

  return {
    name: "Filesystem Destination",
    filter: config.filter,
    processFile: processFile(config),
    clean: clean(config),
  };
}

// Named exports
export * from "./config";
export { filesystem };

// Export `filesystem` as the default export
// tslint:disable: no-default-export
export default filesystem;

// CommonJS default export hack
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = Object.assign(module.exports.default, module.exports);  // tslint:disable-line: no-unsafe-any
}
