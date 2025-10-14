import { useState, useEffect } from 'react';
import { Button, Descriptions, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { fetch, getGcsDownloadUrl } from '../../apiClient';

interface SellerData {
  id: number;
  name: string;
  shop_name: string;
  shop_address: string;
  phone: string;
  verification_document_gcs_path?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  backButton: {
    padding: '4px',
    color: '#4D4D4D',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  },
  section: {
    background: '#FFFFFF',
    borderRadius: '4px',
    padding: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: '0 0 16px 0',
  },
  divider: {
    height: '1px',
    background: '#E6E6E6',
    marginBottom: '24px',
  },
  sectionContent: {
    display: 'grid',
    gap: '16px',
  },
  linkButton: {
    padding: 0,
  },
};

const SellerViewScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [seller, setSeller] = useState<SellerData | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const sellerId = searchParams.get('id');

  useEffect(() => {
    if (sellerId) {
      fetchSellerData(sellerId);
    }
  }, [sellerId]);

  const fetchSellerData = async (id: string) => {
    setLoading(true);
    try {
      const warehouseId = localStorage.getItem('warehouse_id') || '0';
      const response = await fetch<{ success: boolean; message: string; data: SellerData }>(
        `/sc3_admin/sellers/${id}`,
        { query: { warehouse_id: Number(warehouseId) } },
        {
          success: true,
          message: 'fetched successfully',
          data: {
            id: 1,
            name: 'Seller ABC',
            shop_name: 'Shop ABC',
            shop_address: '123, Market St, Cityville',
            phone: '8801712345678',
            verification_document_gcs_path: '/documents/verification_doc_1.pdf',
          },
        }
      );

      setSeller(response.data);
    } catch (error) {
      message.error('Failed to fetch seller data');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = async () => {
    if (!seller?.verification_document_gcs_path) return;

    try {
      const url = await getGcsDownloadUrl(
        seller.verification_document_gcs_path,
        '/sc3_admin/get_gcs_download_url'
      );
      window.open(url, '_blank');
    } catch (error) {
      message.error('Failed to open document');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.goBack()}
          style={styles.backButton}
        />
        <h1 style={styles.heading}>View seller - {sellerId}</h1>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Seller details</h2>
        <div style={styles.divider} />
        <div style={styles.sectionContent}>
          {seller && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Seller ID">{seller.id}</Descriptions.Item>
              <Descriptions.Item label="Seller Name">{seller.name}</Descriptions.Item>
              <Descriptions.Item label="Shop Name">{seller.shop_name}</Descriptions.Item>
              <Descriptions.Item label="Phone">{seller.phone}</Descriptions.Item>
              <Descriptions.Item label="Shop Address">{seller.shop_address}</Descriptions.Item>
              {seller.verification_document_gcs_path && (
                <Descriptions.Item label="Verification Document">
                  <Button type="link" onClick={handleDocumentClick} style={styles.linkButton}>
                    View Document
                  </Button>
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerViewScreen;
