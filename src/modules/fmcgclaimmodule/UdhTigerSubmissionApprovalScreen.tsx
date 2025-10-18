import { useState, useEffect } from 'react';
import { Table, Input, Button, DatePicker, Pagination, Modal, Form, message } from 'antd';
import { useHistory } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { fetch as apiFetch } from '@/apiClient';

interface ExtraDetails {
  start_date: string;
  end_date: string;
  warehouse_id: string;
  warehouse_name: string;
  claim_used_amount: string;
  anchor_claim_amount: string;
  mismatch_amount: string;
}

interface ApprovalEntity {
  entity_id: string;
  entity_uuid: string;
  entity_type: string;
  entity_status: string;
  created_at: string;
  creator_uuid: string;
  allowed_actions: string[];
  extra_details: ExtraDetails;
}

interface ListResponse {
  status: number;
  message: string;
  data: ApprovalEntity[];
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    backgroundColor: '#F6F6F6',
    minHeight: 'calc(100vh - 64px)',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: '8px',
  },
  subTitle: {
    fontSize: '14px',
    color: '#4D4D4D',
    marginBottom: '0',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterItem: {
    minWidth: '200px',
  },
  input: {
    width: '100%',
  },
  filterActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
};

const UdhTigerSubmissionApprovalScreen = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApprovalEntity[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    claimId: '',
    warehouseId: '',
    month: null as Dayjs | null,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const history = useHistory();

  const fetchApprovals = async (page = 1) => {
    setLoading(true);
    try {
      const payload: any = {
        page,
        per_page: pagination.pageSize,
        entity_type: 'UdhFmcgClaimEntity',
        data_filters: {},
      };

      if (filters.claimId) {
        payload.entity_uuid = filters.claimId;
      }
      if (filters.warehouseId) {
        payload.data_filters.warehouse_id = filters.warehouseId;
      }
      if (filters.month) {
        payload.data_filters.claim_month = filters.month.format('YYYY-MM-01');
      }

      const response = await apiFetch<ListResponse>(
        '/approval_service/approval_entity/index',
        {
          method: 'POST',
          body: payload,
        },
        {
          status: 200,
          message: 'fetched successfully',
          data: [
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
          ],
        }
      );

      setData(response.data);
      setPagination({
        ...pagination,
        current: page,
        total: response.data.length,
      });
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApplyFilters = () => {
    fetchApprovals(1);
  };

  const handleResetFilters = () => {
    setFilters({
      claimId: '',
      warehouseId: '',
      month: null,
    });
    setTimeout(() => fetchApprovals(1), 0);
  };

  const selectedEntities = data.filter((item) =>
    selectedRowKeys.includes(item.entity_id)
  );

  const totalClaimAmount = selectedEntities.reduce(
    (sum, item) => sum + parseFloat(item.extra_details.claim_used_amount || '0'),
    0
  );

  const totalAnchorAmount = selectedEntities.reduce(
    (sum, item) => sum + parseFloat(item.extra_details.anchor_claim_amount || '0'),
    0
  );

  const mismatchAmount = Math.abs(totalClaimAmount - totalAnchorAmount);
  const hasMismatch = totalClaimAmount !== totalAnchorAmount;

  const handleBulkApprove = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        entity_ids: selectedRowKeys,
        user_action: 'Approve',
        notes: values.mismatch_reason || '',
      };

      const response = await apiFetch(
        '/approval_service/approval_entity/bulk_upsert_entity_action',
        {
          method: 'POST',
          body: payload,
        },
        {
          status: 200,
          is_error: false,
          message: 'Bulk approval successful',
        }
      );

      message.success(response.message);
      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);
      fetchApprovals(pagination.current);
    } catch (error: any) {
      console.error('Error bulk approving:', error);
      message.error(error.message || 'Failed to bulk approve');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Claim ID',
      dataIndex: 'entity_uuid',
      key: 'entity_uuid',
      width: 120,
    },
    {
      title: 'Date Range',
      key: 'date_range',
      width: 200,
      render: (_: any, record: ApprovalEntity) =>
        `${dayjs(record.extra_details.start_date).format('DD MMM YYYY')} - ${dayjs(
          record.extra_details.end_date
        ).format('DD MMM YYYY')}`,
    },
    {
      title: 'DB ID',
      dataIndex: ['extra_details', 'warehouse_id'],
      key: 'warehouse_id',
      width: 100,
    },
    {
      title: 'DB Name',
      dataIndex: ['extra_details', 'warehouse_name'],
      key: 'warehouse_name',
      width: 150,
    },
    {
      title: 'Claim Used Amount',
      dataIndex: ['extra_details', 'claim_used_amount'],
      key: 'claim_used_amount',
      width: 150,
      render: (value: string) => `৳${value}`,
    },
    {
      title: 'Anchor Claim Amount',
      dataIndex: ['extra_details', 'anchor_claim_amount'],
      key: 'anchor_claim_amount',
      width: 150,
      render: (value: string) => `৳${value}`,
    },
    {
      title: 'Mismatch',
      dataIndex: ['extra_details', 'mismatch_amount'],
      key: 'mismatch_amount',
      width: 120,
      render: (value: string) => `৳${value}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: ApprovalEntity) => (
        <Button
          type="link"
          onClick={() => {
            history.push(`claimsubmissionview?id=${record.entity_uuid}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>UDH Tiger Submission Approval</h1>
        <p style={styles.subTitle}>List of all claim submissions pending for UDH Tiger approval</p>
      </div>

      <div style={styles.filters}>
        <div style={styles.filterItem}>
          <Input
            placeholder="Claim ID"
            value={filters.claimId}
            onChange={(e) => setFilters({ ...filters, claimId: e.target.value })}
            style={styles.input}
          />
        </div>
        <div style={styles.filterItem}>
          <Input
            placeholder="Warehouse ID"
            value={filters.warehouseId}
            onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
            style={styles.input}
          />
        </div>
        <div style={styles.filterItem}>
          <DatePicker
            placeholder="Select Month"
            picker="month"
            value={filters.month}
            onChange={(date) => setFilters({ ...filters, month: date })}
            style={styles.input}
          />
        </div>
          <div style={styles.filterActions}>
            <Button type="link" onClick={handleApplyFilters}>
              Apply
            </Button>
            <Button type="link" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
      </div>

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={handleBulkApprove}>
            Approve ({selectedRowKeys.length})
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={data}
        rowKey="entity_id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
        bordered
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys as string[]),
        }}
      />

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page) => fetchApprovals(page)}
          showSizeChanger={false}
          showTotal={(total) => `Total ${total} items`}
        />
      </div>

      <Modal
        title="Do you want to bulk approve these claims?"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Yes, approve"
        cancelText="Cancel"
        confirmLoading={loading}
      >
        {hasMismatch && (
          <p style={{ color: '#F94949', marginBottom: '16px' }}>
            Gap of ৳{mismatchAmount.toFixed(2)} mismatched amount is present in the claim. You may
            be penalised for the gap amount.
          </p>
        )}

        <div style={{ marginBottom: '16px' }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>Number of claims selected:</strong> {selectedRowKeys.length}
          </p>
          <p style={{ marginBottom: '8px' }}>
            <strong>Total claim amount:</strong> ৳{totalClaimAmount.toFixed(2)}
          </p>
          <p style={{ marginBottom: '8px' }}>
            <strong>Anchor claim amount:</strong> ৳{totalAnchorAmount.toFixed(2)}
          </p>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="Mismatch reason"
            name="mismatch_reason"
            rules={[{ required: hasMismatch, message: 'Please provide a mismatch reason' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter reason for mismatch" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UdhTigerSubmissionApprovalScreen;
