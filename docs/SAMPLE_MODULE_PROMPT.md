Build a new module named Sellers (udhsellermodule) with 3 screens: List, Create/Edit, and View. There are no submodules.

1. Seller Listing Screen
   Heading: “Sellers”
   Subheading: “List of all sellers associated to the warehouse”
   Actions: “Create Seller” → navigates to create screen
   Filters:

Seller ID (numeric input)
Seller Name (text input)
Shop Name (text input)
Phone (numeric input, Bangladesh phone format)

Table columns: Seller ID, Seller Name, Shop Name, Shop Address, Phone, Actions (Edit → navigates to edit screen with ID param)
Pagination: default page size = 20

List API
Route: /sc3_admin/sellers/list
Method: GET
Query params: id, name, shop_name, phone, page, per_page, warehouse_id
Mock response:

```json
{
  "success": true,
  "message": "fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Seller ABC",
      "shop_name": "Shop ABC",
      "shop_address": "123, Market St, Cityville",
      "phone": "8801712345678"
    },
    {
      "id": 2,
      "name": "Seller XYZ",
      "shop_name": "Shop XYZ",
      "shop_address": "456, Commerce Ave, Townsville",
      "phone": "8801987654321"
    }
  ]
}
```

2. Create/Edit Seller Screen
   Use the same form component for both routes.

Create screen heading: “Create Seller”

Edit screen heading: “Edit Seller – <seller ID>” (takes seller id as query param)

Fetch single seller API
Route: /sc3_admin/sellers/<id>
Method: GET
Allowed query params: warehouse_id
Mock response:

```json
{
  "success": true,
  "message": "fetched successfully",
  "data": {
    "id": 1,
    "name": "Seller ABC",
    "shop_name": "Shop ABC",
    "shop_address": "123, Market St, Cityville",
    "phone": "8801712345678",
    "verification_document_gcs_path": "/documents/verification_doc_1.pdf"
  }
}
```

Form sections:
Seller Details: Seller Name (text, max 80 chars), Shop Name (text, max 150 chars), Phone (numeric, Bangladesh format), Shop Address (textarea, max 3 lines)
Supporting Documents: Verification Document (single file upload, image or PDF)

Create Seller API
Route: /sc3_admin/sellers/create
Method: POST
Payload:

```json
{
  "name": "Seller ABC",
  "shop_name": "Shop ABC",
  "shop_address": "123, Market St, Cityville",
  "phone": "8801712345678",
  "verification_document_gcs_path": "/documents/verification_doc_1.pdf"
}
```

Response:

```json
{
  "success": true,
  "message": "Seller created successfully",
  "seller_id": 12345
}
```

Edit Seller API
Route: /sc3_admin/sellers/<id>
Method: POST
Payload:

```json
{
  "id": 12345,
  "name": "Seller ABC",
  "shop_name": "Shop ABC",
  "shop_address": "123, Market St, Cityville",
  "phone": "8801712345678",
  "verification_document_gcs_path": "/documents/verification_doc_1.pdf"
}
```

Response:

```json
{
  "success": true,
  "message": "Seller edited successfully"
}
```

File Upload API (used by uploadFileToGcs)
Route: /sc3_admin/get_gcs_upload_url
Payload:

```json
{
  "file_extension": "<file_extension>",
  "file_type": "SellerVerificationDocument"
}
```

3. View Seller Screen
   Heading: “View Seller – <seller ID>”
   Displays seller details from the single-seller GET API in one section.
   For verification document, clicking it should fetch a signed URL via getGcsDownloadUrl (same route /sc3_admin/get_gcs_upload_url) and open in a new tab.
