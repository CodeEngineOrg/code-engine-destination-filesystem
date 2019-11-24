import { Filter } from "@code-engine/types";
import { validate } from "@code-engine/validate";
import * as nodeFS from "fs";
import { promisify } from "util";
import { FileSystemConfig, FS } from "./config";

/**
 * Validates and normalizes the configuration.
 * @internal
 */
export function normalizeConfig(config?: FileSystemConfig): NormalizedConfig {
  config = validate.type.object(config, "config");
  let path = validate.string.nonWhitespace(config.path, "path");
  let filter = config.filter;
  let fs: FSPromises = nodeFS;

  if (config.fs) {
    fs = {
      mkdir: validate.type.function(config.fs.mkdir, "fs.mkdir", nodeFS.mkdir),
      writeFile: validate.type.function(config.fs.writeFile, "fs.writeFile", nodeFS.writeFile),
      promises: {
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
    mkdir(path: string, option: nodeFS.MakeDirectoryOptions): Promise<void>;
    writeFile(path: string, data: Buffer, options: object): Promise<void>;
  };
}
