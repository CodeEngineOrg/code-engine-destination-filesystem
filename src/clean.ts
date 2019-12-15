import { Context } from "@code-engine/types";
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

    // Move the output directory to the OS trash.
    // This is safer than permanently deleting it,
    // and allows users to roll-back to previous output if they want.
    await trash(dir, { glob: false });
  };
}
