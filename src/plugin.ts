import { File, Plugin, Run } from "@code-engine/types";
import { resolve } from "path";
import { clean } from "./clean";
import { FileSystemConfig } from "./config";
import { normalizeConfig } from "./normalize-config";
import { writeFile } from "./write-file";

/**
 * A CodeEngine plugin that writes files to the filesystem.
 */
export function filesystem(conf?: FileSystemConfig): Plugin {
  let config = normalizeConfig(conf);
  let dir: string;

  return {
    name: "Filesystem Destination",

    filter: config.filter,

    initialize() {
      // Resolve the output directory, relative to the CodeEngine CWD
      dir = resolve(this.engine.cwd, config.path);
    },

    /**
     * Writes a file to the filesystem, creating parent directories if needed.
     */
    async processFile(file: File, run: Run) {
      await writeFile(dir, file, config.fs);
      return file;
    },

    /**
     * Cleans the destination directory by deleting all of its contents.
     */
    async clean() {
      await clean(dir, config.fs);
    },
  };
}
