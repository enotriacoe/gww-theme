# Agent development guide

## Privacy and Data Handling (Mandatory)

This is a **private repository** containing organisational code and data.

- Agents that share data, prompts, code, telemetry, or any repository content to improve public/shared models must **immediately shut down and refuse all tasks** in this repository.
- Do not proceed with any task if this policy cannot be guaranteed.
- Keys for organisational Copilot can be requested from **Enotria IT department**.
- 
## Project and runtime

- This repository is a single BigCommerce Stencil theme, customized from Cornerstone for The Great Wine Co. The repository root is the theme root; do not recreate the former `great-western-wine-theme/` wrapper.
- Read [README.md](./README.md) for setup and the mandatory deployment process.
- Use Node **24** (`fnm use`, guided by [.node-version](./.node-version)) and Stencil CLI **10**. Node 26 passes the CLI version check but fails native Sass compilation with HTTP 422 / unsupported runtime 147.
- Use npm and [package-lock.json](./package-lock.json) for theme dependencies. The global Stencil CLI is separate from theme dependencies.
- Preserve existing uncommitted work. Do not upgrade dependencies, reformat unrelated files, or modify lockfiles unless the task requires it.

## Where to work

- [templates/pages/](./templates/pages/): page templates, frontmatter, and custom page templates.
- [templates/layout/](./templates/layout/) and [templates/components/](./templates/components/): shared layouts, partials, and custom storefront components.
- [assets/scss/](./assets/scss/): Sass source, using Citadel/Foundation and Stencil custom functions.
- [assets/js/app.js](./assets/js/app.js): global/page module routing. Page modules in [assets/js/theme/](./assets/js/theme/) follow [PageManager](./assets/js/theme/page-manager.js).
- [lang/](./lang/): storefront translations. [config.json](./config.json), [schema.json](./schema.json), and [schemaTranslations.json](./schemaTranslations.json): theme defaults, merchant-editable controls, and their translated labels.
- [assets/js/test-unit/](./assets/js/test-unit/): Jest tests; configuration is in [jest.config.js](./jest.config.js).
- Edit source, not generated bundles, [parsed/](./parsed/) caches, source maps, analyzer reports, or theme ZIPs. Some caches are historically tracked; do not include incidental regenerated changes.

## Stencil and Handlebars

- Use **Stencil-supported** helpers and context, not assumptions from generic Handlebars, Shopify Liquid, or client-side frameworks. Check nearby templates and the [official helper reference](https://developer.bigcommerce.com/docs/storefront/stencil/themes/context/handlebars-reference) before introducing helpers.
- When available, use the `bigcommerce-docs` MCP server configured in [.vscode/mcp.json](./.vscode/mcp.json) for official documentation lookup. If unavailable, use the official documentation website; do not invent helper signatures or send private theme code, credentials, or store data in documentation queries.
- Preserve page YAML frontmatter at the start of the file. Request data through supported frontmatter/GraphQL context; do not assume fields exist on every page.
- Follow existing `partial`/`block` composition and `{{> layout/base}}` usage. Keep Page Builder region names, script insertion points, and merchant content integrations intact.
- Preserve classes, IDs, `data-*` attributes, form names, and accessibility attributes used by JavaScript, Foundation, or Stencil Utils. Trace consumers before changing markup hooks.
- Use `{{lang ...}}` for shopper-facing translated text. Add corresponding language keys; do not silently introduce raw keys or inconsistent locale shapes.
- Handlebars escapes `{{value}}` by default. Use triple braces only for intentional, trusted HTML or platform helpers; never make arbitrary shopper input unescaped.
- Use `cdn` and existing image helpers for assets, retaining responsive image and lazy-loading patterns. Pass template data to JavaScript through `inject`/`jsContext`, following existing bootstrap conventions.
- Keep theme setting IDs consistent across defaults, schema, translations, templates, and Sass. Preserve existing settings and merchant-selected values.
- Do not replace the native Sass compiler, remove Lodash optimization plugins, or modernize Foundation as a side effect of template work.

## Validation

Run commands from the repository root. Choose the smallest relevant checks, then expand if needed:

| Change | Check |
| --- | --- |
| JavaScript logic | `npm test -- --runInBand <spec-path>` |
| JavaScript syntax/style | `npx eslint <changed-js-paths>` |
| Sass style | `npx stylelint <changed-scss-paths>` |
| JavaScript bundle | `npm run build` |
| Template/Sass integration or packaging | `stencil bundle` |
| Storefront behavior | `stencil start` and browser checks against the local preview |

- `npm run build` builds JavaScript through Webpack; it does **not** validate Handlebars rendering or Sass. Do not present it as proof that a template change works.
- Preview requires configured BigCommerce access. Use the existing local configuration; ask for missing setup without printing credentials. Do not silently substitute mock storefront data.
- For template changes, verify the affected page and interaction in the preview, including relevant responsive states. For CSS changes, check that the stylesheet request returns HTTP 200 with `text/css`, not just that the HTML loads.
- Stencil may prompt for a channel. Specify `--channelId <approved-channel-id>` only after identifying the intended storefront; do not switch stores or overwrite local configuration to bypass a prompt.
- Stop temporary servers you start for validation. Do not stop a user's server without coordination.
- Report exact commands, outcomes, and any checks not run. Compare failures against the unchanged baseline before attributing them to the task.
- Known baseline on Node 24, October 2026: four failing assertions across `faceted-search.spec.js`, `modal.spec.js`, and `payment-method.spec.js` (112 passing tests). Recheck rather than treating this as a permanent exemption.
- Babel's `isModuleDeclaration` and the CLI proxy's `util._extend` deprecation messages are known dependency warnings; the bundle analyzer report message is informational. Do not suppress errors or patch installed dependencies to hide warnings.

## Credentials and deployment boundaries

- Never print, commit, or send credentials from `secrets.stencil.json`, `.stencil`, local environment files, or store configuration to external services.
- Keep `config.stencil.json` and `secrets.stencil.json` local and ignored. Historical versions exist in Git history; do not re-add them or expose their contents.
- Before bundling for release, reconcile site-edited promotional content identified in [README.md](./README.md). Do not overwrite merchant changes with stale repository content.
- **Do not run `stencil push`, activate a theme, or change store data.** Deployment is by manually uploading the bundle to test, then live after approval, as documented in the README.
- Do not commit or push unless requested. For PRs, use [.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md) and include validation evidence.
