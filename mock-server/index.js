import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4567;

// Middleware
// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from data directory
app.use('/sc3_admin/data', express.static(path.join(__dirname, 'data')));

// Helper functions to read/write data
const readJSON = async (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

const writeJSON = async (filename, data) => {
  const filePath = path.join(__dirname, 'data', filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// ==================== SELLER APIs ====================

// Get all sellers (with filters and pagination)
app.get('/sc3_admin/sellers/list', async (req, res) => {
  try {
    let sellers = await readJSON('sellers.json');
    const { id, name, shop_name, phone, page = 1, per_page = 20, warehouse_id } = req.query;

    // Apply filters
    if (id) {
      sellers = sellers.filter(seller => seller.id === parseInt(id));
    }
    if (name) {
      sellers = sellers.filter(seller =>
        seller.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (shop_name) {
      sellers = sellers.filter(seller =>
        seller.shop_name.toLowerCase().includes(shop_name.toLowerCase())
      );
    }
    if (phone) {
      sellers = sellers.filter(seller => seller.phone.includes(phone));
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(per_page);
    const endIndex = startIndex + parseInt(per_page);
    const paginatedSellers = sellers.slice(startIndex, endIndex);

    // Remove verification_document_gcs_path from list response
    const sellersWithoutDoc = paginatedSellers.map(({ verification_document_gcs_path, ...seller }) => seller);

    res.json({
      success: true,
      message: "fetched successfully",
      data: sellersWithoutDoc,
      total: sellers.length,
      page: parseInt(page),
      per_page: parseInt(per_page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get seller by ID
app.get('/sc3_admin/sellers/:id', async (req, res) => {
  try {
    const sellers = await readJSON('sellers.json');
    const seller = sellers.find(s => s.id === parseInt(req.params.id));

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    res.json({
      success: true,
      message: "fetched successfully",
      data: seller
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create seller
app.post('/sc3_admin/sellers/create', async (req, res) => {
  try {
    const sellers = await readJSON('sellers.json');
    const newId = sellers.length > 0 ? Math.max(...sellers.map(s => s.id)) + 1 : 1;

    const newSeller = {
      id: newId,
      name: req.body.name,
      shop_name: req.body.shop_name,
      shop_address: req.body.shop_address,
      phone: req.body.phone,
      verification_document_gcs_path: req.body.verification_document_gcs_path
    };

    sellers.push(newSeller);
    await writeJSON('sellers.json', sellers);

    res.json({
      success: true,
      message: "Seller created successfully",
      seller_id: newId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Edit seller
app.post('/sc3_admin/sellers/:id', async (req, res) => {
  try {
    const sellers = await readJSON('sellers.json');
    const sellerIndex = sellers.findIndex(s => s.id === parseInt(req.params.id));

    if (sellerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    sellers[sellerIndex] = {
      id: parseInt(req.params.id),
      name: req.body.name,
      shop_name: req.body.shop_name,
      shop_address: req.body.shop_address,
      phone: req.body.phone,
      verification_document_gcs_path: req.body.verification_document_gcs_path
    };

    await writeJSON('sellers.json', sellers);

    res.json({
      success: true,
      message: "Seller edited successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== FILE APIs ====================

// Get GCS upload URL (mock)
app.get('/sc3_admin/get_gcs_upload_url', async (_, res) => {
  try {
    const files = await readJSON('files.json');

    // Get a random file from the existing files
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No files available"
      });
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];

    res.json({
      success: true,
      message: "File uploaded successfully",
      file_url: "/health",
      file_path: randomFile.gcs_path
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get GCS download URL
app.get('/sc3_admin/get_gcs_download_url', async (_, res) => {
  try {
    const files = await readJSON('files.json');

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No files available"
      });
    }

    // Get a random file from the existing files
    const randomFile = files[Math.floor(Math.random() * files.length)];

    res.json({
      success: true,
      message: "Download URL generated successfully",
      file_url: randomFile.download_url
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== APPROVAL APIs ====================

// Approval entity index (POST method for list API)
app.post('/approval_service/approval_entity/index', async (req, res) => {
  try {
    const { page = 1, per_page = 20, entity_uuid, entity_type, data_filters = {} } = req.body;

    const mockData = [
      {
        entity_id: '1',
        entity_uuid: '123',
        entity_type: 'UdhFmcgClaimEntity',
        entity_status: 'ROM Approval Pending',
        created_at: '2023-02-15T10:00:00Z',
        creator_uuid: '987',
        allowed_actions: ['Approve', 'Reject'],
        extra_details: {
          start_date: '2023-01-01',
          end_date: '2023-01-31',
          warehouse_id: '101',
          warehouse_name: 'Warehouse A',
          claim_used_amount: '5000',
          anchor_claim_amount: '7000',
          mismatch_amount: '2000',
        },
      },
      {
        entity_id: '2',
        entity_uuid: '124',
        entity_type: 'UdhFmcgClaimEntity',
        entity_status: 'UDH Tiger Approval Pending',
        created_at: '2023-02-16T11:00:00Z',
        creator_uuid: '988',
        allowed_actions: ['Approve', 'Reject'],
        extra_details: {
          start_date: '2023-01-01',
          end_date: '2023-01-31',
          warehouse_id: '102',
          warehouse_name: 'Warehouse B',
          claim_used_amount: '6000',
          anchor_claim_amount: '8500',
          mismatch_amount: '2500',
        },
      },
    ];

    let filteredData = mockData;

    // Apply filters
    if (entity_uuid) {
      filteredData = filteredData.filter((item) => item.entity_uuid === entity_uuid);
    }
    if (data_filters.warehouse_id) {
      filteredData = filteredData.filter(
        (item) => item.extra_details.warehouse_id === data_filters.warehouse_id
      );
    }
    if (data_filters.claim_month) {
      filteredData = filteredData.filter(
        (item) => item.extra_details.start_date.startsWith(data_filters.claim_month.substring(0, 7))
      );
    }

    res.json({
      status: 200,
      message: 'fetched successfully',
      data: filteredData,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET  /sc3_admin/sellers/list`);
  console.log(`   - GET  /sc3_admin/sellers/:id`);
  console.log(`   - POST /sc3_admin/sellers/create`);
  console.log(`   - POST /sc3_admin/sellers/:id`);
  console.log(`   - GET /sc3_admin/get_gcs_upload_url`);
  console.log(`   - GET /sc3_admin/get_gcs_download_url`);
  console.log(`   - POST /approval_service/approval_entity/index`);
  console.log(`   - GET  /health`);
});
