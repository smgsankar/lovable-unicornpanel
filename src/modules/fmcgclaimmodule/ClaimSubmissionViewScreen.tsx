import { useState, useEffect } from 'react';
import { Button, Card, Spin, message, Tag } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetch, getGcsDownloadUrl } from '../../apiClient';
import dayjs from 'dayjs';

interface ClaimData {
  id: number;
  warehouse_id: number;
  discount_start_date: string;
  discount_end_date: string;
  claim_amount: number;
  order_claim_amount: number;
  order_damaged_amount: number;
  supporting_documents: string;
  status: number;
  mismatch_reason: string | null;
}

const STATUS_OPTIONS = [
  { value: 1, label: 'ROM Submission Approval Pending', color: 'orange' },
  { value: 2, label: 'ROM Rejected', color: 'red' },
  { value: 3, label: 'LT Submission Approval Pending', color: 'blue' },
  { value: 4, label: 'LT Rejected', color: 'red' },
  { value: 5, label: 'Created', color: 'default' },
  { value: 6, label: 'Realized', color: 'green' },
];

const getStatusLabel = (status: number) => {
  return STATUS_OPTIONS.find(s => s.value === status)?.label || '';
};

const getStatusColor = (status: number) => {
  return STATUS_OPTIONS.find(s => s.value === status)?.color || 'default';
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: '0 0 24px 0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: '16px',
  },
  fieldRow: {
    display: 'flex',
    marginBottom: '16px',
  },
  fieldLabel: {
    width: '250px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1A1A1A',
  },
  fieldValue: {
    flex: 1,
    fontSize: '14px',
    color: '#4D4D4D',
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
};

const ClaimSubmissionViewScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const claimId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);

  useEffect(() => {
    if (claimId) {
      fetchClaimData(claimId);
    }
  }, [claimId]);

  const fetchClaimData = async (id: string) => {
    setLoading(true);
    try {
      const warehouseId = localStorage.getItem('warehouse_id') || '0';
      const response = await fetch<{ success: boolean; message: string; data: ClaimData }>(
        '/sc2_admin/claim/show',
        { query: { id, warehouse_id: Number(warehouseId) } },
        {
          success: true,
          message: 'fetched successfully',
          data: {
            id: 456,
            warehouse_id: 123,
            discount_start_date: '2024-01-01',
            discount_end_date: '2024-01-31',
            claim_amount: 15000.50,
            order_claim_amount: 30000,
            order_damaged_amount: 0,
            supporting_documents: '/claim-docs.pdf,/claim-docs2.pdf',
            status: 1,
            mismatch_reason: null,
          },
        }
      );

      setClaimData(response.data);
    } catch (error: any) {
      console.error('Error fetching claim data:', error);
      message.error(error.message || 'Failed to fetch claim data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (filePath: string) => {
    try {
      const url = await getGcsDownloadUrl(filePath, '/sc2_admin/get_gcs_download_url');
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      message.error(error.message || 'Failed to download file');
    }
  };

  const handleViewLifecycle = () => {
    console.log('Lifecycle button clicked');
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!claimData) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Claim not found</h1>
      </div>
    );
  }

  const claimUsedAmount = claimData.order_claim_amount + claimData.order_damaged_amount;
  const mismatch = claimUsedAmount - claimData.claim_amount;
  const supportingDocs = claimData.supporting_documents.split(',').filter(doc => doc);

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button 
            icon={<ArrowLeft size={20} />} 
            onClick={() => history.push('/fmcgclaimmodule/claimsubmissionlist')}
            type="text"
          />
          <h1 style={{ ...styles.heading, margin: 0 }}>View Claim - {claimData.id}</h1>
        </div>
        <Tag color={getStatusColor(claimData.status)}>{getStatusLabel(claimData.status)}</Tag>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Claim details</h2>
        <Card>
          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Claim ID</div>
            <div style={styles.fieldValue}>{claimData.id}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>From date</div>
            <div style={styles.fieldValue}>
              {dayjs(claimData.discount_start_date).format('DD MMM YYYY')}
            </div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>To date</div>
            <div style={styles.fieldValue}>
              {dayjs(claimData.discount_end_date).format('DD MMM YYYY')}
            </div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>DB ID</div>
            <div style={styles.fieldValue}>{claimData.warehouse_id}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>DB Name</div>
            <div style={styles.fieldValue}>-</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Order claim amount</div>
            <div style={styles.fieldValue}>৳{claimData.order_claim_amount.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Order damage amount</div>
            <div style={styles.fieldValue}>৳{claimData.order_damaged_amount.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Claim used amount</div>
            <div style={styles.fieldValue}>৳{claimUsedAmount.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Anchor claim amount</div>
            <div style={styles.fieldValue}>৳{claimData.claim_amount.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Mismatch</div>
            <div style={styles.fieldValue}>৳{mismatch.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Anchor system file(s)</div>
            <div style={styles.fieldValue}>
              <div style={styles.fileList}>
                {supportingDocs.map((doc, index) => (
                  <Button
                    key={index}
                    type="link"
                    onClick={() => handleDownloadFile(doc)}
                    style={{ padding: 0, textAlign: 'left' }}
                  >
                    {doc.split('/').pop() || `Document ${index + 1}`}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>View lifecycle</div>
            <div style={styles.fieldValue}>
              <Button type="link" onClick={handleViewLifecycle} style={{ padding: 0 }}>
                View
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClaimSubmissionViewScreen;
