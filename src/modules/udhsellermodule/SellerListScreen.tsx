import { useState, useEffect } from 'react';
import { Button, Input, Table, Space } from 'antd';
import { useHistory } from 'react-router-dom';
import { fetch } from '../../apiClient';
import styles from './SellerListScreen.module.css';

interface Seller {
  id: number;
  name: string;
  shop_name: string;
  shop_address: string;
  phone: string;
}

interface ListResponse {
  success: boolean;
  message: string;
  data: Seller[];
}

const SellerListScreen = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    shop_name: '',
    phone: '',
  });

  const fetchSellers = async (page = 1) => {
    setLoading(true);
    try {
      const warehouseId = localStorage.getItem('warehouse_id') || '0';
      const queryParams: Record<string, any> = {
        page,
        per_page: pagination.pageSize,
        warehouse_id: Number(warehouseId),
      };

      if (filters.id) queryParams.id = filters.id;
      if (filters.name) queryParams.name = filters.name;
      if (filters.shop_name) queryParams.shop_name = filters.shop_name;
      if (filters.phone) queryParams.phone = filters.phone;

      const response = await fetch<ListResponse>(
        '/sc3_admin/sellers/list',
        { query: queryParams },
        {
          success: true,
          message: 'fetched successfully',
          data: [
            {
              id: 1,
              name: 'Seller ABC',
              shop_name: 'Shop ABC',
              shop_address: '123, Market St, Cityville',
              phone: '8801712345678',
            },
            {
              id: 2,
              name: 'Seller XYZ',
              shop_name: 'Shop XYZ',
              shop_address: '456, Commerce Ave, Townsville',
              phone: '8801987654321',
            },
          ],
        }
      );

      setSellers(response.data);
      setPagination({ ...pagination, current: page, total: response.data.length });
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApplyFilters = () => {
    fetchSellers(1);
  };

  const handleResetFilters = () => {
    setFilters({ id: '', name: '', shop_name: '', phone: '' });
    setTimeout(() => fetchSellers(1), 0);
  };

  const handleEdit = (id: number) => {
    history.push(`edit?id=${id}`);
  };

  const columns = [
    {
      title: 'Seller ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Seller Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Shop Name',
      dataIndex: 'shop_name',
      key: 'shop_name',
    },
    {
      title: 'Shop Address',
      dataIndex: 'shop_address',
      key: 'shop_address',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => `৳${phone}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Seller) => (
        <Button type="link" onClick={() => handleEdit(record.id)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Sellers</h1>
          <p className={styles.subHeading}>List of all sellers associated to the warehouse</p>
        </div>
        <Button type="primary" onClick={() => history.push('create')}>
          Create Seller
        </Button>
      </div>

      <div className={styles.filters}>
        <Input
          placeholder="Seller ID"
          type="number"
          value={filters.id}
          onChange={(e) => setFilters({ ...filters, id: e.target.value })}
          className={styles.filterInput}
        />
        <Input
          placeholder="Seller Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className={styles.filterInput}
        />
        <Input
          placeholder="Shop Name"
          value={filters.shop_name}
          onChange={(e) => setFilters({ ...filters, shop_name: e.target.value })}
          className={styles.filterInput}
        />
        <Input
          placeholder="Phone"
          type="number"
          value={filters.phone}
          onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
          className={styles.filterInput}
        />
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
        dataSource={sellers}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => fetchSellers(page),
        }}
      />
    </div>
  );
};

export default SellerListScreen;
