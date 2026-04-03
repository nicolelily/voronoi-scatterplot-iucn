This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).

It's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis), [journalism](https://github.com/nshiab/journalism), and others great open-source librairies with [SvelteKit](https://svelte.dev/docs/kit/introduction).

Here's the recommended workflow:

- Put your raw data in the `sda/data` folder. Note that this folder is gitignored.
- Use the `sda/main.ts` file to clean and process your raw data. Write the results to the `src/data` or `static/` folders.
- Import your processed data from the `src/data` folder into the `src/routes/+page.svelte` or fetch it with `src/routes/+page.ts`.
- Use the data for your content.

When working on your project, you can use the following commands:

- `deno task sda` will watch your `sda/main.ts` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.
- `deno task dev` will start a local server and watch all `src/*` files and their dependencies. Everytime you'll save some changes or the data is reprocessed, the content will be updated.

By opening two terminals each running one of the above commands, you'll be able to work on your project with a live preview of your content and data.
  