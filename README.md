# Great Western Wine
BigCommerce platform theme based off Cornerstone (Light version) for Great Western Wine website

## IMPORTANT - DEPLOYMENT PROCESS

When deploying changes to the stencil theme, any changes on the live or test environment to the below files must be imported into the theme/repo first, due to GWW using the files for promotional material that is updated directly on the sites:
- templates/components/common/home-banners.html
- templates/components/common/usp-block.html

The theme should never be pushed directly using the command line, instead, the `stencil bundle` command will create a ZIP file of the theme that can then be uploaded to the test environment, then the live environment following approval.

## Installation:
The theme runs independently from the platform and it requires an active BigCommerce account to get access to the API & Data from local. API/Access tokens & keys can be found on TeamsID.

The theme uses the **Stencil** CLI. Use Node **24** with Stencil CLI **10**. The CLI's native Node Sass dependency does not support Node 26, even though the CLI's Node version check accepts it. Running the preview on Node 26 causes stylesheet requests to return HTTP 422 with an "Unsupported runtime (147)" error.

The repository root is also the theme directory and contains a `.node-version` file for Node version managers such as `fnm`. Run the following commands from the repository root in the same terminal that will start Stencil:

```sh
fnm use
node --version # Must report v24.x
yarn global add @bigcommerce/stencil-cli@10.1.1
stencil --version
```

If Node 24 is not installed, run `fnm install 24` first. With another version manager, select Node 24 using its equivalent command. Use one version manager consistently.

Once the global CLI tool is installed, run `npm install` from the repository root to get the packages needed to run Stencil against the theme. All commands below also run from the repository root.

After changing Node versions, stop any running `stencil start` process and restart it from the Node 24 terminal. An already-running server keeps its original Node runtime; installing a newer CLI does not change it.

Main commands to use are:

`stencil init` To initialise the project, this will ask for store details (API token, etc) which have to be generated from the account.

`stencil start` basically a *watch* command that uses BrowserSync and connects the theme to the store, and starts a server to see the store running. Also compiles assets and reloads the server with the changes.

`stencil bundle` build task, generates all assets and packages the theme for use.

`stencil push` uploads the compiled/bundled theme to the BigCommerce account so it can be activated.

There are other commands but these are the basic ones we will need

## Tech stack
Cornerstone is built with Handlebars, Sass and Javascript.

### Markup / Templates
Handlebars is the JS template engine, and there are many parts to the theme, spread out in a bunch of folders. Many of the pieces are tied with JS functions to perform actions in the store, so we have to be careful about changing things.

The theme uses **Frontmatter** (YAML style format on top of page files) across pages to pull data from the API and make it available to the pages.

- [Custom templates](https://developer.bigcommerce.com/stencil-docs/storefront-customization/custom-templates)
- [Store design overview](https://developer.bigcommerce.com/stencil-docs/configure-store-design-ui/store-design-overview)

### Styles
The styles are written in Sass, using a custom pattern library called **Citadel** which in turn runs on top of Zurb Foundation 5.5. Extend the styles is quite easy and straightforward, and we have the power of Foundation behind as well.

Many of the common styles/variables are defined in `config.json` file so they're integrated with BigCommerce panel, including colours, font sizes, font families, and many others.

- [Custom Sass functions](https://developer.bigcommerce.com/stencil-docs/storefront-customization/custom-sass-functions)

### Javascript
Uses a module system/syntax and each part is separated in a file and imported to a main application bundle, this is all handled by Stencil CLI.

- [Custom JS](https://developer.bigcommerce.com/stencil-docs/javascript-and-event-hooks/customizing-javascript)

### Theme Update
To be able to modify the theme's code/files, we had to create a copy of Cornerstone Light, however copies of themes cannot receive updates from the theme's creator (they advise taking the original theme, updating, then applying our changes to it again, but this doesn't seem feasible due to the scale of changes currently).

## Other things (WIP)
- Invoices
- Analytics

## Extra resources for theme development
[Stencil/Cornerstone docs](https://developer.bigcommerce.com/stencil-docs/getting-started/about-stencil)

### Agent documentation tools

The workspace configures the official BigCommerce documentation MCP server as `bigcommerce-docs` in [.vscode/mcp.json](./.vscode/mcp.json). It provides documentation lookup for Stencil, Handlebars helpers, and other BigCommerce developer topics; it does not configure access to our store.

In VS Code, run **MCP: List Servers** from the Command Palette, select `bigcommerce-docs`, and start it. Review and approve the server trust prompt if shown, then enable its tools in the chat tool picker. No local package installation or store API token is configured.
