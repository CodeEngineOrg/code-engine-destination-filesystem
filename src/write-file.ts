import { File } from "@code-engine/types";
import { dirname, resolve } from "path";
import { FSPromises } from "./normalize-config";

/**
 * Writes the given contents to the specified file path, creating the parent directories if needed.
 *
 * This method is called in parallel by CodeEngine based on the `concurrency` setting.
 * All filesystem IO in Node.js is done via the LibUV thread pool, which defaults to 4 threads.
 * This means that the number of concurrent file writes is the MINIMUM of CodeEngine's `concurrency`
 * setting and LibUV's thread pool size.
 */
export async function writeFile(baseDir: string, file: File, fs: FSPromises, retry = true): Promise<void> {
  let absolutePath = resolve(baseDir, file.path);

  try {
    // Try to write the file
    await fs.promises.writeFile(absolutePath, file.contents, { flag: "w" });
  }
  catch (e) {
    let error = e as NodeJS.ErrnoException;

    if (error && retry && error.code === "ENOENT") {
      // The directory path doesn't exist, so create it
      let dir = dirname(absolutePath);
      await fs.promises.mkdir(dir, { recursive: true });

      // Now try again to write the file
      await fs.promises.writeFile(absolutePath, file.contents, { flag: "w" });
    }
    else {
      throw error;
    }
  }
}
