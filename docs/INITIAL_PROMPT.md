I want to build an admin panel, the basic layout would have a collapsable side navbar with a logo and links to modules and sub modules.
Width of the sidebar should be 200px in expanded state
Logo should take up the full width of the sidebar while maintaining the aspect ratio (it should be atleast 3:1, if not prompt for a confirmation)
The logo should be a link redirecting to the initial route (`/`)
In collapsed state of sidebar, the logo should be hidden
In the sidebar, highlight the active module and/or its submodule with a small indicator to the left
For the initial route(`/`), it should open with the side bar and a blank screen, clicking on the links to modules and sub modules should open the relevant screens, if the link in not valid, it should show a 404 warning and a redirection link back to the initial route
The modules in side navbar should also be collapsable if it has more than 1 sub module, show collapsible sub modules only if the module has 2 or more sub modules, if it has 0 to 1 sub modules, clicking on the module itself should navigate to the relevant screen
The screen routes should always be in the format, `/<module_id>/<sub_module_id or path_to_screen>`
for all the screens, the route should always have exactly 2 segments and 2 segments only with optional query parameters if needed
All the module IDs should have `module` as suffix
The userbase for this panel will be based in Bangladesh, so the values representing money should be prefixed with the taka symbol (৳)
and in case of phone number related fields/values format/validate them properly with the Bangladeshi phone number format
For UI components and styling, strictly use `antd@5.17.2` and react style object (`React.CSSProperties`).
For navigation, strictly use react-router-dom v5 and its useHistory and useLocation hooks
always use history.goBack() for back button click handlers
and when using history.push(), use only the second segment of the target route without any forward slash(`/`)
Use `federation` plugin from `@module-federation/vite` to setup module federation with the following config,

```js
{
  name: "lovableunicornpanel", // container app name here
  filename: "remoteModules.js",
  manifest: true,
  exposes: {},
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
    "react-router-dom": { singleton: true },
    antd: { singleton: true },
  }
}
```

<!-- PS: Replace the colors with the appropriate theme colors -->

use the following color scheme
#1A1A1A - heading font color
#4D4D4D - body font color
#45469D - primary color
#F6F6F6 - body background color
#FFFFFF - section background color
#E6E6E6 - secondary color
#F94949 - error color

<!-- PS: Replace the colors with the appropriate semantic colors -->

for semantic chips/tags use the following colors
success - #ebfbf4
error - #fef4ef
info - #f2f8fe
warning - #fff7ec
neutral - #333333

For folder structure, keep all the modules isolated at `src/modules/<module_id>`, create an `index.ts` file at the root of each module and export all the screen level components of that module from there
For all the modules, once completed coding, make sure that the `index.ts` files of every module is exposed in the module federation plugin as following,

```js
{
  // ...other module federation configs
  exposes: {
    '<module_id>Components': './src/modules/<module_id>/index.ts',
  },
}
```

To start with lets have a small intro module, `lovablehomemodule` - Lovable Home
let the screen have a heading, sub heading and some intro text in the body
