import { useState, useEffect } from 'react';
import { Table, Input, Button, DatePicker, Pagination } from 'antd';
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
    backgroundColor: '#FFFFFF',
    minHeight: 'calc(100vh - 64px)',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  subTitle: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '24px',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterItem: {
    minWidth: '200px',
  },
  input: {
    width: '100%',
  },
};

const RomSubmissionApprovalScreen = () => {
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
      render: (value: string) => `₹${value}`,
    },
    {
      title: 'Anchor Claim Amount',
      dataIndex: ['extra_details', 'anchor_claim_amount'],
      key: 'anchor_claim_amount',
      width: 150,
      render: (value: string) => `₹${value}`,
    },
    {
      title: 'Mismatch',
      dataIndex: ['extra_details', 'mismatch_amount'],
      key: 'mismatch_amount',
      width: 120,
      render: (value: string) => `₹${value}`,
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
            history.push(`/fmcgclaimmodule/claimsubmissionview?id=${record.entity_uuid}`);
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
        <h1 style={styles.title}>ROM Submission Approval</h1>
        <p style={styles.subTitle}>List of all claim submissions pending for ROM approval</p>
      </div>

      <div style={styles.filters}>
        <div style={styles.filterItem}>
          <Input
            placeholder="Claim ID"
            value={filters.claimId}
            onChange={(e) => setFilters({ ...filters, claimId: e.target.value })}
            style={styles.input}
            type="number"
          />
        </div>
        <div style={styles.filterItem}>
          <Input
            placeholder="Warehouse ID"
            value={filters.warehouseId}
            onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
            style={styles.input}
            type="number"
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
        <Button type="primary" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
        <Button onClick={handleResetFilters}>Reset</Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="entity_id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
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
    </div>
  );
};

export default RomSubmissionApprovalScreen;
