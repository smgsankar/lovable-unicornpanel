import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { fetch, uploadFileToGcs } from '../../apiClient';
import styles from './SellerFormScreen.module.css';

const { TextArea } = Input;

interface SellerData {
  id?: number;
  name: string;
  shop_name: string;
  shop_address: string;
  phone: string;
  verification_document_gcs_path?: string;
}

const SellerFormScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  
  const searchParams = new URLSearchParams(location.search);
  const sellerId = searchParams.get('id');
  const isEdit = !!sellerId;

  useEffect(() => {
    if (isEdit && sellerId) {
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

      form.setFieldsValue(response.data);
      if (response.data.verification_document_gcs_path) {
        setFileList([
          {
            uid: '-1',
            name: 'verification_document.pdf',
            status: 'done',
            url: response.data.verification_document_gcs_path,
          },
        ]);
      }
    } catch (error) {
      message.error('Failed to fetch seller data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let verificationDocPath = values.verification_document_gcs_path;

      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;
        const fileExtension = file.name.split('.').pop();
        verificationDocPath = await uploadFileToGcs({
          file,
          route: '/sc3_admin/get_gcs_upload_url',
          options: {
            file_extension: fileExtension,
            file_type: 'SellerVerificationDocument',
          },
        });
      }

      const payload = {
        ...values,
        verification_document_gcs_path: verificationDocPath,
      };

      if (isEdit) {
        payload.id = Number(sellerId);
        await fetch(
          `/sc3_admin/sellers/${sellerId}`,
          { method: 'POST', body: payload },
          { success: true, message: 'Seller edited successfully' }
        );
        message.success('Seller updated successfully');
      } else {
        const response = await fetch<{ success: boolean; message: string; seller_id: number }>(
          '/sc3_admin/sellers/create',
          { method: 'POST', body: payload },
          { success: true, message: 'Seller created successfully', seller_id: 12345 }
        );
        message.success('Seller created successfully');
      }

      history.goBack();
    } catch (error) {
      message.error('Failed to save seller');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    fileList,
    beforeUpload: (file: any) => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValidType) {
        message.error('You can only upload PDF or image files!');
        return false;
      }
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
    maxCount: 1,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.goBack()}
          className={styles.backButton}
        />
        <h1 className={styles.heading}>
          {isEdit ? `Edit seller - ${sellerId}` : 'Create Seller'}
        </h1>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Seller details</h2>
          <div className={styles.divider} />
          <div className={styles.sectionContent}>
            <Form.Item
              name="name"
              label="Seller Name"
              rules={[
                { required: true, message: 'Please enter seller name' },
                { max: 80, message: 'Maximum 80 characters allowed' },
              ]}
            >
              <Input placeholder="Enter seller name" maxLength={80} />
            </Form.Item>

            <Form.Item
              name="shop_name"
              label="Shop Name"
              rules={[
                { required: true, message: 'Please enter shop name' },
                { max: 150, message: 'Maximum 150 characters allowed' },
              ]}
            >
              <Input placeholder="Enter shop name" maxLength={150} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Please enter phone number' },
                {
                  pattern: /^(\+?880|0)?1[3-9]\d{8}$/,
                  message: 'Please enter a valid Bangladesh phone number',
                },
              ]}
            >
              <Input placeholder="01712345678" type="tel" />
            </Form.Item>

            <Form.Item
              name="shop_address"
              label="Shop Address"
              rules={[{ required: true, message: 'Please enter shop address' }]}
            >
              <TextArea placeholder="Enter shop address" rows={3} />
            </Form.Item>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Supporting documents</h2>
          <div className={styles.divider} />
          <div className={styles.sectionContent}>
            <Form.Item
              name="verification_document"
              label="Verification Document"
              rules={[{ required: !isEdit, message: 'Please upload verification document' }]}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={() => history.goBack()}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Update Seller' : 'Create Seller'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SellerFormScreen;
