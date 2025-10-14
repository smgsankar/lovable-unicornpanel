This is an admin panel project, here the base layout has a collapsable side navbar with a logo and links to modules and sub modules.

The width of the sidebar should be 230px in expanded state. The logo should take up the full width of the sidebar while maintaining the aspect ratio (it should be atleast 3:1, if not prompt for a confirmation). The logo should be a link redirecting to the initial route (`/`). In collapsed state of sidebar, the logo should be hidden.

In the sidebar, highlight the active module and/or its submodule with a small indicator to the left. For the initial route(`/`), it should open with the side bar and a blank screen, clicking on the links to modules and sub modules should open the relevant screens, if the link in not valid, it should show a 404 warning and a redirection link back to the initial route.

The modules in side navbar should also be collapsable if it has more than 1 sub module, show collapsible sub modules only if the module has 2 or more sub modules, if it has 0 to 1 sub modules, clicking on the module itself should navigate to the relevant screen.

The screen routes should always be in the format, `/<module_id>/<sub_module_id or path_to_screen>`
for all the screens, the route should always have exactly 2 segments and 2 segments only with optional query parameters if needed. All the module IDs should have `module` as suffix.

The userbase for this panel will be based in Bangladesh, so the values representing money should be prefixed with the taka symbol (৳), and in case of phone number related fields/values format/validate them properly with the Bangladeshi phone number format.

For UI components and styling, strictly use antd and plain CSS modules, and import the CSS modules close to where it is being used. Keep all the screen relevant styles in its respective CSS module
do not abstract any common styles away from the modules.

For navigation, strictly use react-router-dom v5 and its useHistory and useLocation hooks
always use history.goBack() for back button click handlers
and when using history.push(), use only the second segment of the target route without any forward slash(`/`).

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

In most cases, we will have 2 types of layouts

- listing screen
- action screen

for listing screen layouts,
the page header will have a heading, and can(optionally) have a sub heading and a primary action
then, it will have a few filters with apply and reset buttons (link style)
followed by a table showing the data, paginated normally 20 items per page

for action screen layouts,
in most cases, we would land in the action screen by clicking on some links from the respective listing screens
the action screen will have a heading with a back icon button
there are 2 primary types of action screen layouts - view details layout and form-based(create/edit forms) layouts
both the layouts will have one or more sections and each section will have a title, content(based on the type of layout) and a divider separating the content from the title

For folder structure, keep all the modules isolated at `src/modules/<module_id>`, create an `index.ts` file at the root of each module and export all the screen level components of that module from there.

For all the modules, once completed coding, make sure that the `index.ts` files of every module is exposed in the module federation plugin as following,

```js
{
  // ...other module federation configs
  exposes: {
    '<module_id>Components': './src/modules/<module_id>/index.ts',
  },
}
```

For API calls, instead of using window.fetch, use fetch method defined in src/apiClient.ts
that fetch method accepts mock response as the third parameter in addition to API route and request options, refer to the jsdoc in the same file for the method definition.

Here, mock response for the fetch method is mandatory. So, for all the API integrations, if mock response is not given with the prompt, specifically ask for one

For file upload based fields, upon form submission, before calling the form submit related API, upload the relevant files in the form with the `uploadFileToGcs` method in `src/apiClient.ts` file and add the returned gcs path from the method to the submit API payload in the relevant key/field.

Similarly to download a file or opening a file in new tab, check if the API returns a file gcs path, if so get the signed URL for the file/resource with the help of `getGcsDownloadUrl` method in `src/apiClient.ts` file and then download the file from the URL or open the URL in the new tab whichever is needed.

For any API, if it requires `warehouse_id` in request params/payload, get the value from local storage (key - warehouse_id) and pass it as a number, if the value is not available pass 0
