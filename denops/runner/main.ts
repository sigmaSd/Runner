import { Denops } from "https://deno.land/x/denops_std@v3.0.0/mod.ts";
import * as vars from "https://deno.land/x/denops_std@v3.0.0/variable/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v3.0.0/function/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v3.0.0/helper/mod.ts";
import config_dir from "https://deno.land/x/dir@1.4.0/config_dir/mod.ts";
import { fileExist } from "./utils.ts";

const fileType = async (denops: Denops) =>
  await vars.options.get(denops, "filetype") as string;
const lines = async (denops: Denops) =>
  await vars.options.get(denops, "lines") as number;
const filePath = async (denops: Denops) =>
  await denops.eval('expand("%:p")') as string;
const terminalIsAlive = async (denops: Denops) => {
  const allTypes = await fn.execute(denops, "windo echo &buftype") as string;
  return allTypes.includes(
    "terminal",
  );
};

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(args: unknown) {
      const currentFileType = await fileType(denops);
      const userScriptPath = config_dir() + "/" + "vim-runner" + "/" +
        currentFileType + "/" + "plugin.ts";

      if (!await fileExist(userScriptPath)) {
        console.error(
          `No plugin found for ${currentFileType} files`,
        );
        return;
      }
      // save current buffer
      await denops.cmd(":w");

      // currentFilePath needs to be set before the terminal is created
      // replace '\' with '/' to avoid some issues with windows
      const currentFilePath = await filePath(denops).then((path) =>
        path.replaceAll("\\", "/")
      );

      const terminal = Deno.build.os === "windows" ? "powershell" : "fish";
      if (!await terminalIsAlive(denops)) {
        await denops.cmd(
          `:bel split term://${terminal}`,
        );
        await denops.cmd(`resize ${await lines(denops) / 4}`);
      }

      // start terminal in insert mode
      denops.cmd("startinsert");

      // we add 'file:///' because windows needs it
      const plugin = await import("file:///" + userScriptPath) as {
        plugin: (
          denops: Denops,
          filePath: string,
          args: string[],
        ) => Promise<void>;
      };
      if (!plugin.plugin) {
        console.error(`'plugin' function is not defined in ${userScriptPath}`);
        return;
      }
      await plugin.plugin(
        denops,
        currentFilePath,
        (args as string).split(/\s+/),
      );
    },
  };

  await execute(
    denops,
    `command! -nargs=* RunFile call denops#request('${denops.name}', 'run', [<q-args>])`,
  );
}
