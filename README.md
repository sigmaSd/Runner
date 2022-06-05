# Runner

Vim plugin to run the current file with custom (typescript) scripts

## Install

```vim
Plug 'vim-denops/denops.vim' "Allows using plugins written with deno
Plug 'sigmaSd/runner' "This actual plugin
```

## Usage

`:RunFile`

## Explanation

`RunFile` will

- look at the current filetype using `echo &buftype`
- look for a user script located at
  `$config_dir()/vim-runner/${filetype}/plugin.ts`
- run `plugin` function defined in the above script

`plugin` definition can be imported from
https://deno.land/x/runner_api@0.1.0/mod.ts

## Example

**deno runner**

_usage:_ `:RunFile run` `:RunFile repl`

Save this snippet to `$config_dir()/vim-runner/typescript/plugin.ts` and
`$config_dir()/vim-runner/javascript/plugin.ts`

```ts
import { Denops } from "https://deno.land/x/denops_std@v3.0.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v3.0.0/function/mod.ts";
import { type Plugin } from "https://deno.land/x/runner_api@0.1.0/mod.ts";

const feedEnter = async (denops: Denops) =>
  await fn.feedkeys(
    denops,
    Deno.build.os === "windows" ? "\r\n" : "\n",
  );

export const plugin: Plugin = async (denops, filePath, args) => {
  switch (args[0]) {
    case "":
    case "run":
      await denoRun(denops, filePath);
      break;
    case "check":
      await denoCheck(denops, filePath);
      break;
    default:
      console.error("Unknown command: " + args.join(" "));
      break;
  }
};

async function denoRun(denops: Denops, filePath: string) {
  await fn.feedkeys(
    denops,
    `deno run --unstable -A ${filePath}`,
  );
  await feedEnter(denops);
}
/**
 * starts a deno repl with all the file exports imported to the global scope
 */
async function denoRepl(denops: Denops, filePath: string) {
  await fn.feedkeys(
    denops,
    `deno repl --unstable --eval "import * as m from '${filePath}';Object.entries(m).forEach(e=>window[e[0]]=e[1])"`,
  );
  await feedEnter(denops);
}
```

## Keybinding suggestion

```vim
nnoremap <C-x> :RunFile run<CR>
nnoremap <C-a> :RunFile repl<CR>
```
