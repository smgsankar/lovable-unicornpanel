Build an admin panel with a collapsible sidebar layout. The sidebar should contain a logo and navigation links for modules and submodules. When expanded, the sidebar width should be 230px. The logo must occupy the full sidebar width while maintaining its aspect ratio (minimum 3:1). If it does not meet this ratio, prompt for confirmation. The logo should link to the initial route /. When collapsed, the logo should be hidden.

In the sidebar, highlight the active module or submodule with a small indicator on the left. The sidebar should support collapsible submodules — only show collapsible items if a module has two or more submodules. If a module has zero or one submodule, clicking the module should directly navigate to its screen. All module IDs must end with the suffix “module”.

The initial route / should show the sidebar and a blank screen. Clicking on any module or submodule should open its respective screen. Invalid routes should show a 404 warning with a redirect link to /.
All valid routes must follow the structure /<module_id>/<sub_module_id_or_screen_path> — exactly two segments, with optional query parameters.

Use react-router-dom@5 for routing, and use the useHistory and useLocation hooks. For back navigation, always call history.goBack(). When using history.push(), only use the second segment of the route (no leading slash).

The user base is in Bangladesh. All monetary values should be prefixed with the Taka symbol (৳), and all phone numbers must be validated and formatted according to Bangladeshi phone number standards.

Use antd@5.17.2 for all UI components and define styles using React inline style objects (React.CSSProperties).

Color scheme:

Heading: #1A1A1A
Body text: #4D4D4D
Primary: #45469D
Body background: #F6F6F6
Section background: #FFFFFF
Secondary: #E6E6E6
Error: #F94949

For semantic tags:
success: #ebfbf4
error: #fef4ef
info: #f2f8fe
warning: #fff7ec
neutral: #333333

Each module must be located under src/modules/<module_id> and include an index.ts that exports all screen-level components of that module.
Expose each module’s index.ts in the Module Federation config as:
'<module_id>Components': './src/modules/<module_id>/index.ts'

Use the @module-federation/vite plugin with the following configuration:

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


Start with an initial module named lovablehomemodule (Lovable Home).
This module should include a screen with a heading, subheading, and short introductory text.