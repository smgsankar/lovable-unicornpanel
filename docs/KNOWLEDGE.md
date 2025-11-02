Admin Panel Specification

This project is an admin panel application with a collapsible sidebar navigation layout. The sidebar includes a logo and links to modules and submodules. When expanded, the sidebar width should be 230px. The logo must occupy the full width of the sidebar while maintaining its aspect ratio (minimum 3:1). If not, prompt for confirmation. The logo should link to the initial route /, and it should be hidden when the sidebar is collapsed.

In the sidebar, highlight the active module or submodule with a small indicator on the left. The initial route / should open with the sidebar visible and a blank screen. Clicking on a module or submodule should load its respective screen. Invalid links should display a 404 warning and a redirect link to /.

Modules in the sidebar should be collapsible only if they have two or more submodules. If a module has zero or one submodule, clicking it should directly navigate to its screen. All routes must follow the pattern /<module_id>/<sub_module_id_or_screen_path> — exactly two segments with optional query parameters.
All module IDs must end with the suffix module. For submodules, prefix their IDs with the module’s second segment. Submodule IDs do not require a suffix.

The user base is in Bangladesh. Currency values must be prefixed with the Taka symbol (৳). Phone number fields or values should be validated and formatted according to the Bangladeshi phone number format.

Use antd@5.17.2 for UI components and style using React inline styles (React.CSSProperties).
Use react-router-dom@5.3.0 for routing and @types/react-router-dom@5.3.3 for types.
Use useHistory and useLocation hooks for navigation.
For back navigation, always use history.goBack().
When using history.push(), only pass the second segment of the route (no leading slash).

Use the @module-federation/vite plugin for module federation with the configuration below:

```js
{
  name: "lovableunicornpanel",
  filename: "remoteModules.js",
  manifest: true,
  exposes: {},
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
    "react-router-dom": { singleton: true },
    antd: { singleton: true },
  },
}
```

Color scheme:
Heading font: #1A1A1A
Body font: #4D4D4D
Primary: #45469D
Body background: #F6F6F6
Section background: #FFFFFF
Secondary: #E6E6E6
Error: #F94949

Semantic tag colors:
success: #ebfbf4
error: #fef4ef
info: #f2f8fe
warning: #fff7ec
neutral: #333333

There are two primary layout types:

Listing Screen Layout

The header contains a heading and can optionally include a subheading and a primary action button.

Filters appear below the header with Apply and Reset (link-style) buttons.

The content section displays a paginated table (20 items per page).

Action Screen Layout

Accessed by clicking links from listing screens.

Includes a heading with a back icon button.

Two main layout types:

View Details layout

Form-based (create/edit) layout

Each layout consists of one or more sections with a title, content, and a divider.

Folder structure:
Each module should be located under src/modules/<module_id>.
Each module must include an index.ts file exporting all screen-level components.
Expose each module’s index file in the module federation config as:

```js
{
  // ...other federation configs
  exposes: {
    "./<ModuleIdCapitalized>Components": "./src/modules/<module_id>/index.ts",
  },
}
```

For API integration, do not use window.fetch. Use the fetch method defined in src/apiClient.ts.
This fetch method accepts three parameters: the API route, request options, and a required mock response. Always include a mock response. If a mock response is missing in the prompt, explicitly ask for one.

For file upload fields:
Before calling the form submission API, upload files using uploadFileToGcs from src/apiClient.ts.
Add the returned GCS path to the API payload in the relevant key or field.

For file downloads:

If an API response includes a GCS file path, obtain a signed URL using getGcsDownloadUrl from src/apiClient.ts, and use it to either download the file or open it in a new tab.

For any API that requires warehouse_id in the request, retrieve it from local storage (warehouse_id key). Pass it as a number, or 0 if unavailable.

Error handling:
For GET and POST APIs, show appropriate error messages using Ant Design’s message Toast.
For POST (or user-action) APIs, if the server returns a message, display it to the user as a Toast.

For tables, enable horizontal scrolling when needed.
For form-based screens, use two columns unless otherwise specified. Only components like multi-file upload or text area should span two columns; all others should occupy one column, including single file uploads.
For multi-file uploads, support drag and drop for supported file types.
