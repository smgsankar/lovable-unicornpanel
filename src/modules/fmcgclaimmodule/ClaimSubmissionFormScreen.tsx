import { useState, useEffect } from 'react';
import { Button, DatePicker, Input, Upload, Card, Modal, message } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import { fetch, uploadFileToGcs } from '../../apiClient';
import dayjs, { Dayjs } from 'dayjs';
import type { UploadFile } from 'antd/es/upload/interface';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface AggregateData {
  order_claim_amount: number;
  order_damaged_amount: number;
}

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
  formItem: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#1A1A1A',
    fontWeight: 500,
  },
  required: {
    color: '#f94949',
  },
  readOnlyValue: {
    padding: '8px 12px',
    backgroundColor: '#f6f6f6',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1A1A1A',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
};

const ClaimSubmissionFormScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const claimId = searchParams.get('id');
  const isEditMode = !!claimId;

  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);
  const [anchorClaimAmount, setAnchorClaimAmount] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mismatchReason, setMismatchReason] = useState('');

  useEffect(() => {
    if (isEditMode && claimId) {
      fetchClaimData(claimId);
    }
  }, [isEditMode, claimId]);

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
            supporting_documents: '/claim-docs.pdf',
            status: 1,
            mismatch_reason: null,
          },
        }
      );

      const data = response.data;
      setDateRange([dayjs(data.discount_start_date), dayjs(data.discount_end_date)]);
      setAggregateData({
        order_claim_amount: data.order_claim_amount,
        order_damaged_amount: data.order_damaged_amount,
      });
      setAnchorClaimAmount(data.claim_amount.toString());
      setMismatchReason(data.mismatch_reason || '');
      
      // Handle existing files
      if (data.supporting_documents) {
        const existingFiles = data.supporting_documents.split(',').map((path, index) => ({
          uid: `-${index}`,
          name: path.split('/').pop() || `file-${index}`,
          status: 'done' as const,
          url: path,
        }));
        setFileList(existingFiles);
      }
    } catch (error: any) {
      console.error('Error fetching claim data:', error);
      message.error(error.message || 'Failed to fetch claim data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAggregateData = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const warehouseId = localStorage.getItem('warehouse_id') || '0';
      const response = await fetch<{ success: boolean; message: string; data: AggregateData }>(
        '/sc2_admin/claim/aggregate_data',
        {
          query: {
            warehouse_id: Number(warehouseId),
            start_date: startDate,
            end_date: endDate,
          },
        },
        {
          success: true,
          message: 'Aggregate data retrieved successfully',
          data: {
            order_claim_amount: 15000.50,
            order_damaged_amount: 2500.75,
          },
        }
      );

      setAggregateData(response.data);
    } catch (error: any) {
      console.error('Error fetching aggregate data:', error);
      message.error(error.message || 'Failed to fetch aggregate data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    setDateRange(dates);
    if (dates) {
      const [start, end] = dates;
      fetchAggregateData(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    } else {
      setAggregateData(null);
    }
  };

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList.slice(0, 4));
  };

  const handleSubmit = () => {
    if (!dateRange || !anchorClaimAmount || fileList.length === 0) {
      message.error('Please fill all required fields');
      return;
    }

    const claimUsedAmount = (aggregateData?.order_claim_amount || 0) + (aggregateData?.order_damaged_amount || 0);
    const anchorAmount = parseFloat(anchorClaimAmount);
    const mismatch = claimUsedAmount - anchorAmount;

    setIsModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    if (!dateRange || !aggregateData) return;

    const claimUsedAmount = aggregateData.order_claim_amount + aggregateData.order_damaged_amount;
    const anchorAmount = parseFloat(anchorClaimAmount);
    const mismatch = claimUsedAmount - anchorAmount;

    if (Math.abs(mismatch) > 0.01 && !mismatchReason) {
      message.error('Please provide a mismatch reason');
      return;
    }

    setUploading(true);
    try {
      // Upload files
      const uploadedPaths: string[] = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          const fileExtension = file.name.split('.').pop() || '';
          const path = await uploadFileToGcs({
            file: file.originFileObj,
            route: '/sc2_admin/get_gcs_upload_url',
            options: {
              file_extension: fileExtension,
              file_type: 'FmcgClaimAnchorSystemFile',
            },
          });
          uploadedPaths.push(path);
        } else if (file.url) {
          uploadedPaths.push(file.url);
        }
      }

      const warehouseId = localStorage.getItem('warehouse_id') || '0';
      const payload = {
        warehouse_id: Number(warehouseId),
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
        claim_amount: anchorAmount,
        mismatch_reason: Math.abs(mismatch) > 0.01 ? mismatchReason : '',
        supporting_documents: uploadedPaths.join(','),
        ...(isEditMode && { id: Number(claimId) }),
      };

      const endpoint = isEditMode ? '/sc2_admin/claim/edit' : '/sc2_admin/claim/create';
      const response = await fetch<{ success: boolean; message: string; id: number }>(
        endpoint,
        { method: 'POST', body: payload },
        {
          success: true,
          message: isEditMode ? 'Claim edited successfully' : 'Claim created successfully',
          id: 12345,
        }
      );

      message.success(response.message);
      history.push('/fmcgclaimmodule/claimsubmissionlist');
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      message.error(error.message || 'Failed to submit claim');
    } finally {
      setUploading(false);
      setIsModalVisible(false);
    }
  };

  const claimUsedAmount = aggregateData
    ? aggregateData.order_claim_amount + aggregateData.order_damaged_amount
    : 0;
  const mismatch = claimUsedAmount - parseFloat(anchorClaimAmount || '0');

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>
        {isEditMode ? `Edit claim - ${claimId}` : 'Create Claim'}
      </h1>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Claim details</h2>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={styles.formItem}>
              <label style={styles.label}>
                Date range <span style={styles.required}>*</span>
              </label>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ width: '100%' }}
                disabled={loading}
              />
            </div>

            <div style={styles.formItem}>
              <label style={styles.label}>Order claim amount</label>
              <div style={styles.readOnlyValue}>
                ৳{aggregateData ? aggregateData.order_claim_amount.toFixed(2) : '0.00'}
              </div>
            </div>

            <div style={styles.formItem}>
              <label style={styles.label}>Order damage amount</label>
              <div style={styles.readOnlyValue}>
                ৳{aggregateData ? aggregateData.order_damaged_amount.toFixed(2) : '0.00'}
              </div>
            </div>

            <div style={styles.formItem}>
              <label style={styles.label}>Claim used amount</label>
              <div style={styles.readOnlyValue}>
                ৳{claimUsedAmount.toFixed(2)}
              </div>
            </div>

            <div style={styles.formItem}>
              <label style={styles.label}>
                Anchor claim amount <span style={styles.required}>*</span>
              </label>
              <Input
                type="number"
                value={anchorClaimAmount}
                onChange={(e) => setAnchorClaimAmount(e.target.value)}
                placeholder="Enter anchor claim amount"
              />
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Supporting documents</h2>
        <Card>
          <div style={styles.formItem}>
            <label style={styles.label}>
              Anchor system file(s) <span style={styles.required}>*</span>
            </label>
            <Upload.Dragger
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              accept=".jpg,.png,.pdf,.csv,.xls"
              multiple
              maxCount={4}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to upload</p>
              <p className="ant-upload-hint">Support for jpg, png, pdf, csv, xls files (Max 4 files)</p>
            </Upload.Dragger>
          </div>
        </Card>
      </div>

      <div style={styles.buttonGroup}>
        <Button type="primary" onClick={handleSubmit} loading={uploading}>
          {isEditMode ? 'Confirm' : 'Create'}
        </Button>
        <Button onClick={() => history.push('/fmcgclaimmodule/claimsubmissionlist')}>
          Cancel
        </Button>
      </div>

      <Modal
        title="Do you want to submit this claim?"
        open={isModalVisible}
        onOk={handleConfirmSubmit}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={uploading}
      >
        {Math.abs(mismatch) > 0.01 && (
          <p style={{ color: '#f94949', marginBottom: '16px' }}>
            Gap of ৳{Math.abs(mismatch).toFixed(2)} mismatched amount is present in the claim. 
            You may be penalised for the gap amount.
          </p>
        )}
        <div style={{ marginBottom: '8px' }}>
          <strong>Total claim amount:</strong> ৳{claimUsedAmount.toFixed(2)}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <strong>Anchor claim amount:</strong> ৳{parseFloat(anchorClaimAmount || '0').toFixed(2)}
        </div>
        {Math.abs(mismatch) > 0.01 && (
          <div>
            <label style={styles.label}>
              Mismatch reason <span style={styles.required}>*</span>
            </label>
            <TextArea
              rows={4}
              value={mismatchReason}
              onChange={(e) => setMismatchReason(e.target.value)}
              placeholder="Enter reason for mismatch"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClaimSubmissionFormScreen;
