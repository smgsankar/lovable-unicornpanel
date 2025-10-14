import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { HomeOutlined, WarningOutlined } from '@ant-design/icons';
import styles from './NotFound.module.css';

const NotFound = () => {
  const history = useHistory();

  const handleGoHome = () => {
    history.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <WarningOutlined className={styles.icon} />
        </div>
        <h1 className={styles.heading}>404</h1>
        <p className={styles.text}>Page Not Found</p>
        <p className={styles.description}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={handleGoHome}
          className={styles.button}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
