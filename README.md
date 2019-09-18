# Great Western Wine
BigCommerce platform theme based off Cornerstone (Light version) for Great Western Wine website

## Installation:
The theme runs independently from the platform and it requires an active BigCommerce account to get access to the API & Data from local. API/Access tokens & keys can be found on TeamsID.

The theme uses a theme engine called **Stencil** and this runs on Node, it requires specifically Node 8.1.0 (not older, not newer) to install the cli tool globaly:

`npm install -g @bigcommerce/stencil-cli`

In my case I had to use the `n` tool to switch to that specific version of node, but it should work with Brew or other alternatives. 

Once the global CLI tool is installed, we can proceed to download the **Great Western Wine theme - Cyber-Duck** theme, then `cd` into the theme folder and run `npm install` to get the packages needed to run Stencil against the theme.

In this step, not all the required packages for **Stencil** were installed correctly and some of the commands failed, so I had to install them as they were requested, after solving a permissions issue with the `node_modules` folder inside the project. 

(Note from Connor - The BigCommerce documentation advises using Node Version Manager [here](https://developer.bigcommerce.com/stencil-docs/installing-stencil-cli/installing-stencil), NVM and n were fine at first for me, but NVM began to overrule n in most cases, so I uninstalled NVM, other than having to sudo install 8.16 with n, I've had no issues since with running Stencil etc.)).

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
