# Lovable UI Integration with AP2 - Adoption Guide

## Overview

This guide outlines the process of integrating Lovable UI components and modules with the existing panels in AP2. The integration leverages Module Federation to create remote modules that can be consumed by the main application in AP2.

## Architecture

The integration follows a micro-frontend architecture using Module Federation, where:

- **lovable-unicornpanel** - Remote application (this repository) that exposes UI modules
- **admin_panel2** - Host application that consumes the remote modules
- Each module is isolated and can be developed independently
- Shared dependencies (React, Ant Design, React Router) are singleton instances

## Project Structure

```
lovable-unicornpanel/
├── src/
│   ├── modules/                     # Isolated modules
│   │   ├── lovablehomemodule/      # Home module
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── HomeScreen.module.css
│   │   │   └── index.ts            # Module exports
│   │   └── udhsellermodule/        # UDH Sellers module
│   │       ├── SellerListScreen.tsx
│   │       ├── SellerFormScreen.tsx
│   │       ├── SellerViewScreen.tsx
│   │       ├── *.module.css files
│   │       └── index.ts            # Module exports
│   ├── layouts/                    # Main layout components specific for Lovable UI
│   ├── apiClient.ts                # API utilities with mock support
│   └── App.tsx                     # Main application
├── docs/                           # Documentation
├── vite.config.ts                  # Vite + Module Federation config
└── package.json                    # Dependencies
```

## Technology Stack

### Core Technologies

- **React 18.3.1** - Frontend framework
- **TypeScript** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **Node.js 22.10.0** - JavaScript runtime

### UI Framework

- **Ant Design 5.17.2** - Primary UI component library (strict version requirement)
- **React Style Objects** - Styling using `React.CSSProperties` objects
- **CSS Modules** - Component-scoped styling (legacy, prefer React style objects)

### Module Federation

- **@module-federation/vite** - Vite plugin for Module Federation
- **React Router DOM 5.3.0** - Client-side routing (strict v5 requirement for compatibility)

### Development Tools

- **lovable-tagger** - Development mode component tagging
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules

## Getting Started

### Prerequisites

```bash
# Install Node.js 22.10.0
node --version  # Should be 22.10.0
```

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

   The development server runs on `http://localhost:8080`

### Available Scripts

```bash
# Development (Lovable environment)
npm run dev

# Development (Local environment)
npm run start

# Build for different environments
npm run build           # Lovable production
npm run build:dev       # Lovable development
npm run build:mokamdev   # Development environment
npm run build:mokamstage # Staging environment
npm run build:mokamprod  # Production environment

# Linting
npm run lint

# Preview built application
npm run preview
```

## Module Federation Configuration

### Exposed Modules

The application exposes the following modules:

```javascript
exposes: {
  "./LovablehomemoduleComponents": "./src/modules/lovablehomemodule/index.ts",
  "./UdhsellermoduleComponents": "./src/modules/udhsellermodule/index.ts",
}
```

### Shared Dependencies

```javascript
shared: {
  react: { singleton: true },
  "react-dom": { singleton: true },
  "react-router-dom": { singleton: true },
  antd: { singleton: true },
}
```

## Creating New Modules

### Step 1: Module Structure

Create a new module following this pattern:

```
src/modules/yourmodule/
├── index.ts                    # Export all components
├── YourListScreen.tsx         # Listing screen with React style objects
├── YourFormScreen.tsx         # Create/Edit form with React style objects
├── YourViewScreen.tsx         # Detail view screen with React style objects
└── styles.ts                  # Shared style objects (optional)
```

**Note**: Prefer React style objects (`React.CSSProperties`) over CSS modules for styling. CSS modules are legacy and should only be used for existing components.

### Step 2: Export Components

In `src/modules/yourmodule/index.ts`:

```typescript
export { default as YourListScreen } from "./YourListScreen";
export { default as YourFormScreen } from "./YourFormScreen";
export { default as YourViewScreen } from "./YourViewScreen";
```

### Step 3: Add to Module Federation

Update `vite.config.ts`:

```typescript
exposes: {
  // ... existing modules
  "./YourmoduleComponents": "./src/modules/yourmodule/index.ts",
}
```

### Step 4: Update Routing

Add routes in `src/App.tsx`:

```typescript
<Route exact path="/yourmodule/list" component={YourListScreen} />
<Route exact path="/yourmodule/create" component={YourFormScreen} />
<Route exact path="/yourmodule/edit" component={YourFormScreen} />
<Route exact path="/yourmodule/view" component={YourViewScreen} />
```

## API Integration

### Using the API Client

The project includes a custom API client with mock support:

```typescript
import { fetch } from "@/apiClient";

// API call with mock response
const response = await fetch(
  "/api/sellers",
  {
    method: "GET",
  },
  {
    // Mock response (required for development)
    data: [{ id: 1, name: "John Doe", phone: "+8801234567890" }],
    success: true,
  }
);
```

### File Upload

```typescript
import { uploadFileToGcs } from "@/apiClient";

const gcsPath = await uploadFileToGcs(file);
// Use gcsPath in your API payload
```

### File Download

```typescript
import { getGcsDownloadUrl } from "@/apiClient";

const downloadUrl = await getGcsDownloadUrl(gcsPath);
window.open(downloadUrl, "_blank");
```

## Design Guidelines

### Styling Guidelines

**Primary Approach**: Use React style objects (`React.CSSProperties`) for all styling:

```typescript
import React from "react";
import { Button, Card } from "antd";

const YourComponent: React.FC = () => {
  // Define styles as React.CSSProperties objects
  const containerStyle: React.CSSProperties = {
    padding: "24px",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  };

  const headerStyle: React.CSSProperties = {
    color: "#1A1A1A",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "16px",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#45469D",
    borderColor: "#45469D",
    color: "#FFFFFF",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Module Title</h1>
      <Button type="primary" style={buttonStyle}>
        Action Button
      </Button>
    </div>
  );
};
```

### Localization

- Currency values: Use Bangladeshi Taka symbol (৳)
- Phone numbers: Validate with Bangladesh format (+880XXXXXXXXX)
- Date format: Follow local conventions

## Integration with Host Application

### Consumer Side (admin_panel2)

1. **Add Remote Configuration**

   ```javascript
   // In webpack.config.js or vite.config.js
   remotes: {
     lovableunicornpanel: "<host_url>/remoteModules.js"
   }
   ```

2. **Import and Use Components**

   ```typescript
   const { SellerListScreen, SellerFormScreen } = await import(
     "lovableunicornpanel/UdhsellermoduleComponents"
   );
   ```

3. **Add to Router**
   ```typescript
   <Route path="/udh/sellers" component={SellerListScreen} />
   <Route path="/udh/sellers/create" component={SellerFormScreen} />
   ```

## Best Practices

### Module Development

1. **Isolation**: Keep modules completely isolated - no cross-module imports
2. **Export Pattern**: Always export through `index.ts` files
3. **Styling**: Use React style objects (`React.CSSProperties`) for all styling - avoid CSS modules for new components
4. **Navigation**: Use React Router v5 APIs strictly (useHistory, useLocation)
5. **API Mocking**: Always provide mock responses for development
6. **Ant Design**: Use Ant Design 5.17.2 components exclusively for UI elements

## Deployment

### Build Process

```bash
# Build for production
npm run build:mokamprod
```

The build creates:
- dist/assets/ - Static assets
- dist/remoteModules.js - Module federation manifest
- dist/index.html - Standalone app (for development)

## Troubleshooting

### Common Issues

1. **Module Federation Errors**

   - Ensure shared dependencies versions match between host and remote
   - Check network connectivity to remote module URL
   - Verify CORS headers are properly configured

2. **Styling Issues**

   - Verify React style objects are correctly typed as `React.CSSProperties`
   - Check for conflicting Ant Design component styles
   - Ensure color constants match the defined palette
   - For legacy components, verify CSS modules are properly imported

3. **Routing Issues**
   - Confirm React Router v5 compatibility
   - Check route definitions in both host and remote
   - Verify navigation patterns (`history.push` without leading `/`)

## Support and Documentation

- **Internal Documentation**: Check `/docs` folder for detailed guides
- **Component Library**: Refer to Ant Design documentation
- **Module Federation**: Review @module-federation/vite documentation
- **API Patterns**: See examples in existing modules

## Contributing

1. Follow the established folder structure
2. Use TypeScript for all new components
3. Use React style objects (`React.CSSProperties`) for styling - avoid CSS modules for new components
4. Strictly use Ant Design 5.17.2 components for UI elements
5. Follow React Router v5 patterns for navigation
6. Add proper exports to module index files
7. Update Module Federation configuration
8. Test integration with host application
9. Document any new patterns or conventions

---

This adoption guide provides a comprehensive overview of integrating Lovable UI with AP2. For specific implementation details, refer to the existing code examples in the `src/modules` directory.
