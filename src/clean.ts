import { ono } from "@jsdevtools/ono";
import * as trash from "trash";
import { FSPromises } from "./normalize-config";

/**
 * Cleans the destination directory by deleting all of its contents.
 */
export async function clean(dir: string, fs: FSPromises) {
  let exists = await directoryExists(dir, fs);

  if (exists) {
    // Move the output directory to the OS trash.
    // This is safer than permanently deleting it,
    // and allows users to roll-back to previous output if they want.
    await trash(dir, { glob: false });
  }
}

/**
 * Determines whether the specified directory exists.
 * An error is thrown if the path exists and is not a directory.
 */
async function directoryExists(dir: string, fs: FSPromises): Promise<boolean> {
  try {
    let stats = await fs.promises.stat(dir);

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
