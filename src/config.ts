import { Filter } from "@code-engine/types";
import { MakeDirectoryOptions, NoParamCallback, WriteFileOptions } from "fs";

/**
 * Configuration for the fileystem destination plugin.
 */
export interface FileSystemConfig {
  /**
   * The relative or absolute path of the destination directory.
   */
  path: string;

  /**
   * Glob patterns, regular expressions, or filter functions that limit which files are written.
   *
   * Defaults to all files.
   */
  filter?: Filter;

  /**
   * Custom filesystem functions to call instead of Node's `fs` API.
   *
   * @see https://nodejs.org/api/fs.html
   */
  fs?: Partial<FS>;
}

/**
 * Custom filesystem functions to call instead of Node's `fs` API.
 *
 * @see https://nodejs.org/api/fs.html
 */
export interface FS {
  /**
   * Creates a directory. Also creates its parent directories if the `recursive` option is set.
   */
  mkdir(path: string, options: MakeDirectoryOptions, callback: NoParamCallback): void;

  /**
   * Writes data to a file, replacing the file if it already exists.
   */
  writeFile(path: string, data: Buffer, options: WriteFileOptions, callback: NoParamCallback): void;
}
