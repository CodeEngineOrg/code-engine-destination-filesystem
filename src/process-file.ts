import { Context, File, FileProcessor } from "@code-engine/types";
import { dirname, resolve } from "path";
import { FSPromises, NormalizedConfig } from "./normalize-config";

/**
 * Writes a file to the filesystem.
 *
 * This method is called in parallel by CodeEngine based on the `concurrency` setting.
 * All filesystem IO in Node.js is done via the LibUV thread pool, which defaults to 4 threads.
 * This means that the number of concurrent file writes is the MINIMUM of CodeEngine's `concurrency`
 * setting and LibUV's thread pool size.
 */
export function processFile(config: NormalizedConfig): FileProcessor {
  return async (file: File, context: Context): Promise<File> => {
    // Resolve the output path, relative to the config path and/or the CWD
    let path = resolve(context.cwd, config.path, file.path);

    await writeFile(path, file.contents, config.fs);
    return file;
  };
}

/**
 * Writes the given contents to the specified file path, creating the parent directories if needed.
 */
async function writeFile(path: string, contents: Buffer, fs: FSPromises, retry = true): Promise<void> {
  try {
    // Try to write the file
    await fs.promises.writeFile(path, contents, { mode: "w" });
  }
  catch (e) {
    let error = e as NodeJS.ErrnoException;

    if (error && retry && error.code === "ENOENT") {
      // The directory path doesn't exist, so create it
      let dir = dirname(path);
      await fs.promises.mkdir(dir, { recursive: true });

      // Now try again to write the file
      await writeFile(path, contents, fs, false);
    }
    else {
      throw error;
    }
  }
}
