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

`plugin` needs to have this definition:

```ts
export async function plugin(
  denops: Denops,
  currentFilePath: string,
): Promise<void>;
```

## Example

**deno runner**

save this snippet to `$config_dir()/vim-runner/typescript/plugin.ts` and
`$config_dir()/vim-runner/javascript/plugin.ts`

```ts
import { Denops } from "https://deno.land/x/denops_std@v3.0.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v3.0.0/function/mod.ts";

const feedEnter = async (denops: Denops) =>
  await fn.feedkeys(
    denops,
    Deno.build.os === "windows" ? "\r\n" : "\n",
  );

export async function plugin(denops: Denops, currentFilePath: string) {
  await fn.feedkeys(
    denops,
    `deno run --unstable -A ${currentFilePath}`,
  );
  await feedEnter(denops);
}
```

## Keybinding suggestion

```vim
nnoremap <C-x> :RunFile<CR>
```
