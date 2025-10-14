# Server

Mock API server for Unicorn Panel development with Lovable UI.

## Setup

```bash
npm install
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## Available Endpoints

### Sellers APIs
- `GET /sc3_admin/sellers/list` - List all sellers with filters and pagination
- `GET /sc3_admin/sellers/:id` - Get seller by ID
- `POST /sc3_admin/sellers/create` - Create new seller
- `POST /sc3_admin/sellers/:id` - Update seller

### File APIs
- `POST /api/uploadFileToGcs` - Upload file (mock)
- `POST /api/getGcsDownloadUrl` - Get signed download URL

### Health Check
- `GET /health` - Server health status

## Data Files

- `data/sellers.json` - Sellers data
- `data/files.json` - File registry for mock GCS operations
