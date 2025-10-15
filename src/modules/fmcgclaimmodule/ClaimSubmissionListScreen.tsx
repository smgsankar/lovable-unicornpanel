import { useState, useEffect } from 'react';
import { Button, Input, Select, Table, Tag, Space, DatePicker, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { fetch } from '../../apiClient';
import dayjs from 'dayjs';

const { MonthPicker } = DatePicker;

interface Realization {
  id: number;
  status: number;
}

interface ClaimSubmission {
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
  realizations: Realization[];
}

interface ListResponse {
  success: boolean;
  message: string;
  data: ClaimSubmission[];
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
    padding: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  },
  subHeading: {
    fontSize: '16px',
    color: '#4D4D4D',
    margin: '4px 0 0 0',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    alignItems: 'center',
  },
  filterInput: {
    width: '200px',
  },
};

const ClaimSubmissionListScreen = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<ClaimSubmission[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  
  const [filters, setFilters] = useState({
    id: '',
    status: undefined as number | undefined,
    month: null as dayjs.Dayjs | null,
  });

  const fetchClaims = async (page = 1) => {
    setLoading(true);
    try {
      const warehouseId = localStorage.getItem('warehouse_id') || '0';
      const queryParams: Record<string, any> = {
        page,
        per_page: pagination.pageSize,
        warehouse_id: Number(warehouseId),
      };

      if (filters.id) queryParams.id = filters.id;
      if (filters.status) queryParams.status = filters.status;
      if (filters.month) {
        const startDate = filters.month.startOf('month').format('YYYY-MM-DD');
        const endDate = filters.month.endOf('month').format('YYYY-MM-DD');
        queryParams.start_date = startDate;
        queryParams.end_date = endDate;
      }

      const response = await fetch<ListResponse>(
        '/sc2_admin/claim/list',
        { query: queryParams },
        {
          success: true,
          message: 'fetched successfully',
          data: [
            {
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
              realizations: [
                { id: 101, status: 1 },
                { id: 102, status: 1 },
              ],
            },
            {
              id: 457,
              warehouse_id: 123,
              discount_start_date: '2024-02-01',
              discount_end_date: '2024-02-28',
              claim_amount: 25000.00,
              order_claim_amount: 28000,
              order_damaged_amount: 1500,
              supporting_documents: '/claim-docs-457.pdf',
              status: 4,
              mismatch_reason: 'Documentation incomplete',
              realizations: [],
            },
            {
              id: 458,
              warehouse_id: 123,
              discount_start_date: '2024-03-01',
              discount_end_date: '2024-03-31',
              claim_amount: 18000.00,
              order_claim_amount: 18000,
              order_damaged_amount: 0,
              supporting_documents: '/claim-docs-458.pdf',
              status: 5,
              mismatch_reason: null,
              realizations: [],
            },
          ],
        }
      );

      setClaims(response.data);
      setPagination({ ...pagination, current: page, total: response.data.length });
    } catch (error: any) {
      console.error('Error fetching claims:', error);
      message.error(error.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleApplyFilters = () => {
    fetchClaims(1);
  };

  const handleResetFilters = () => {
    setFilters({ id: '', status: undefined, month: null });
    setTimeout(() => fetchClaims(1), 0);
  };

  const columns = [
    {
      title: 'Claim ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left' as const,
      width: 100,
      render: (id: number) => <span>{id}</span>,
    },
    {
      title: 'Date range',
      key: 'date_range',
      render: (_: any, record: ClaimSubmission) => (
        <span>
          {dayjs(record.discount_start_date).format('DD MMM YYYY')} - {dayjs(record.discount_end_date).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: number) => (
        <Tag color={getStatusColor(status)} style={{ whiteSpace: 'normal' }}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Claim Used Amount',
      key: 'claim_used_amount',
      render: (_: any, record: ClaimSubmission) => (
        <span>৳{(record.order_claim_amount + record.order_damaged_amount).toFixed(2)}</span>
      ),
    },
    {
      title: 'Anchor Claim Amount',
      dataIndex: 'claim_amount',
      key: 'claim_amount',
      render: (amount: number) => <span>৳{amount.toFixed(2)}</span>,
    },
    {
      title: 'Mismatch',
      key: 'mismatch',
      render: (_: any, record: ClaimSubmission) => {
        const mismatch = (record.order_claim_amount + record.order_damaged_amount) - record.claim_amount;
        return <span>৳{mismatch.toFixed(2)}</span>;
      },
    },
    {
      title: 'Claim Realized Amount',
      key: 'claim_realized_amount',
      render: () => '-',
    },
    {
      title: 'Claim Due Amount',
      key: 'claim_due_amount',
      render: () => '-',
    },
    {
      title: 'Realization ID(s)',
      dataIndex: 'realizations',
      key: 'realizations',
      render: (realizations: Realization[]) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {realizations.map((r) => (
            <span key={r.id}>{r.id}</span>
          ))}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: ClaimSubmission) => {
        const isRejected = record.status === 2 || record.status === 4;
        
        if (isRejected) {
          return (
            <Button type="link" onClick={() => history.push(`/fmcgclaimmodule/claimsubmissionedit?id=${record.id}`)}>
              Resubmit
            </Button>
          );
        }
        
        return (
          <Button type="link" onClick={() => history.push(`/fmcgclaimmodule/claimsubmissionview?id=${record.id}`)}>
            View
          </Button>
        );
      },
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Claim Submission List</h1>
          <p style={styles.subHeading}>List of all claim submissions</p>
        </div>
        <Button type="primary" onClick={() => history.push('/fmcgclaimmodule/claimsubmissioncreate')}>
          Create Claim Submission
        </Button>
      </div>

      <div style={styles.filters}>
        <Input
          placeholder="Claim ID"
          type="number"
          value={filters.id}
          onChange={(e) => setFilters({ ...filters, id: e.target.value })}
          style={styles.filterInput}
        />
        <DatePicker
          picker="month"
          placeholder="Select Month"
          value={filters.month}
          onChange={(date) => setFilters({ ...filters, month: date })}
          style={styles.filterInput}
        />
        <Select
          placeholder="Status"
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          style={styles.filterInput}
          allowClear
        >
          {STATUS_OPTIONS.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
        <Space>
          <Button type="link" onClick={handleApplyFilters}>
            Apply
          </Button>
          <Button type="link" onClick={handleResetFilters}>
            Reset
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={claims}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1500 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => fetchClaims(page),
        }}
      />
    </div>
  );
};

export default ClaimSubmissionListScreen;
