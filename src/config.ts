import { Filter } from "@code-engine/types";
import { MakeDirectoryOptions, NoParamCallback, Stats, WriteFileOptions } from "fs";

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
   * Returns filesystem information about a directory entry.
   */
  stat(path: string, callback: Callback<Stats>): void;

  /**
   * Creates a directory. Also creates its parent directories if the `recursive` option is set.
   */
  mkdir(path: string, options: MakeDirectoryOptions, callback: NoParamCallback): void;

  /**
   * Writes data to a file, replacing the file if it already exists.
   */
  writeFile(path: string, data: Buffer, options: WriteFileOptions, callback: NoParamCallback): void;
}

/**
 * An error-first callback function.
 */
export declare type Callback<T> = (err: Error | null, result: T) => void;
