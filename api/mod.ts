import { Denops } from "https://deno.land/x/denops_std@v3.0.0/mod.ts";

export type Plugin = (
  denops: Denops,
  filePath: string,
  args: string[],
) => Promise<void>;
