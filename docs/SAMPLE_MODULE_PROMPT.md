Build a new module with the following instructions,

<!-- Basic module details -->
Module ID - udhsellermodule
Module name - Sellers

This module doesn't have any sub modules but it has 3 screens,

<!-- Elaborating screen level information -->
the first one is listing screen,
heading - Sellers
sub heading - List of all sellers associated to the warehouse
actions - Create Seller(redirect to create screen)

filters - seller id(numeric input), seller name(text input), shop name(text input), phone(numeric input - bangladesh phone number format)

then we have the table, which has the following columns,
Seller ID
Seller Name
Shop Name
Shop address
Phone
Actions - Edit(should redirect to create screen with ID param)

and finally, pagination with 20 as default page size

<!-- Sharing API contract with mock response -->
for the list API,
route - /sc3_admin/sellers/list
method - GET
allowed query params - id, name, shop_name, phone, page, per_page, warehouse_id

mock response:

```
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

now, for the create/edit screens - reuse the same component under 2 routes - create and edit

for Edit screen,
heading - Edit seller - <seller ID>
the edit one will have a query parameter id which will take the seller id which needs to be edited

API for getting individual seller data
route - /sc3_admin/sellers/<id>
method - GET
allowed query params - warehouse_id

mock response:

```
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

now for the create form,
heading - Create Seller
we have 2 sections - Seller details, Supporting documents

in seller details section, we will have the following fields
Seller Name(text input - max 80 characters), Shop Name(text input - max 150 characters), Phone(numeric input - bangladesh phone number format), Shop Address(text area input - max 3 lines)

in Supporting documents section, we'll have a file upload for Verification document - it'll only accept 1 file of any image format or pdf

for form submission APIs, in case of create seller,
route - /sc3_admin/sellers/create
method - POST
expected payload format:

```
{
  "name": "Seller ABC",
  "shop_name": "Shop ABC",
  "shop_address": "123, Market St, Cityville",
  "phone": "8801712345678",
  "verification_document_gcs_path": "/documents/verification_doc_1.pdf"
}
```

mock response:

```
{
  "success": true,
  "message": "Seller created successfully",
  "seller_id": 12345
}
```

in case of edit seller,
route - /sc3_admin/sellers/<id>
method - POST
expected payload format:

```
{
  "id": 12345,
  "name": "Seller ABC",
  "shop_name": "Shop ABC",
  "shop_address": "123, Market St, Cityville",
  "phone": "8801712345678",
  "verification_document_gcs_path": "/documents/verification_doc_1.pdf"
}
```

mock response:

```
{
  "success": true,
  "message": "Seller edited successfully"
}
```

for document upload using `uploadFileToGcs` pass the following as options,
route - /sc3_admin/get_gcs_upload_url
```
{
  "file_extension": "<file_extension>",
  "file_type": "SellerVerificationDocument",
}
```

finally, for view screen,
heading - View seller - <seller ID>
show the data from the seller information GET API in a single section `Seller details`

for verification document, on click, get the signed URL from `getGcsDownloadUrl` method with route - /sc3_admin/get_gcs_upload_url and open in a new tab
