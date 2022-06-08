import { Denops } from "https://deno.land/x/denops_std@v3.0.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v3.0.0/function/mod.ts";

/** Plugin type, each plugin needs to export a function with this signature */
export type Plugin = (
  denops: Denops,
  filePath: string,
  args: string[],
) => Promise<void>;

/** Sends enter key to the shell */
export const feedEnter = async (denops: Denops) =>
  await fn.feedkeys(
    denops,
    Deno.build.os === "windows" ? "\r\n" : "\n",
  );

/** Convenience function to execute a command in the shell */
export const execute = async (denops: Denops, cmd: string) => {
  await fn.feedkeys(denops, cmd);
  await feedEnter(denops);
};
