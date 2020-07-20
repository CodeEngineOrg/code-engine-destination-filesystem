import { Filter } from "@code-engine/types";
import { assert } from "@jsdevtools/assert";
import * as nodeFS from "fs";
import { MakeDirectoryOptions, Stats, WriteFileOptions } from "fs"; // tslint:disable-line: no-duplicate-imports
import { promisify } from "util";
import { FileSystemConfig, FS } from "./config";

/**
 * Validates and normalizes the configuration.
 * @internal
 */
export function normalizeConfig(config?: FileSystemConfig): NormalizedConfig {
  config = assert.type.object(config, "config");
  let path = assert.string.nonWhitespace(config.path, "path");
  let filter = config.filter;
  let fs: FSPromises = nodeFS;

  if (config.fs) {
    fs = {
      stat: assert.type.function(config.fs.stat, "fs.stat", nodeFS.stat),
      mkdir: assert.type.function(config.fs.mkdir, "fs.mkdir", nodeFS.mkdir),
      writeFile: assert.type.function(config.fs.writeFile, "fs.writeFile", nodeFS.writeFile),
      promises: {
        stat: promisify(validate.type.function(config.fs.stat, "fs.stat", nodeFS.stat)),
        mkdir: promisify(validate.type.function(config.fs.mkdir, "fs.mkdir", nodeFS.mkdir)),
        writeFile: promisify(validate.type.function(config.fs.writeFile, "fs.writeFile", nodeFS.writeFile)),
      }
    };
  }

  return { path, filter, fs };
}

/**
 * Normalized and sanitized configuration.
 * @internal
 */
export interface NormalizedConfig {
  path: string;
  filter: Filter | undefined;
  fs: FSPromises;
}

/**
 * Promisified wrappers around `fs` functions.
 */
export interface FSPromises extends FS {
  promises: {
    // tslint:disable: completed-docs
    stat(path: string): Promise<Stats>;
    mkdir(path: string, option: MakeDirectoryOptions): Promise<void>;
    writeFile(path: string, data: Buffer, options: WriteFileOptions): Promise<void>;
  };
}
