import { Context } from "@code-engine/types";
import { ono } from "ono";
import { resolve } from "path";
import * as trash from "trash";
import { NormalizedConfig } from "./normalize-config";

/**
 * Cleans the destination directory by deleting all of its contents.
 */
export function clean(config: NormalizedConfig) {
  return async (context: Context): Promise<void> => {
    // Resolve the output path, relative to the config path and/or the CWD
    let dir = resolve(context.cwd, config.path);
    let exists = await directoryExists(dir, config);

    if (exists) {
      // Move the output directory to the OS trash.
      // This is safer than permanently deleting it,
      // and allows users to roll-back to previous output if they want.
      await trash(dir, { glob: false });
    }
  };
}

/**
 * Determines whether the specified directory exists.
 * An error is thrown if the path exists and is not a directory.
 */
async function directoryExists(dir: string, config: NormalizedConfig): Promise<boolean> {
  try {
    let stats = await config.fs.promises.stat(dir);

    if (stats.isDirectory()) {
      // The directory exists
      return true;
    }
    else {
      throw ono({ code: "ENOTDIR", path: dir }, `The destination path is not a directory: ${dir}`);
    }
  }
  catch (err) {
    let error = err as NodeJS.ErrnoException;

    if (error.code === "ENOENT") {
      // The directory does not exist
      return false;
    }
    else {
      // Some other error occurred
      throw err;
    }
  }
}
