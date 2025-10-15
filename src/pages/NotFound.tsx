import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { HomeOutlined, WarningOutlined } from '@ant-design/icons';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 96px)',
    backgroundColor: '#FFFFFF',
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px',
    padding: '40px',
  },
  iconWrapper: {
    marginBottom: '24px',
  },
  icon: {
    fontSize: '72px',
    color: '#F94949',
  },
  heading: {
    color: '#1A1A1A',
    fontSize: '64px',
    fontWeight: 700,
    marginBottom: '8px',
    lineHeight: 1,
  },
  text: {
    color: '#45469D',
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  description: {
    color: '#4D4D4D',
    fontSize: '16px',
    marginBottom: '32px',
    lineHeight: 1.6,
  },
  button: {
    backgroundColor: '#45469D',
    borderColor: '#45469D',
    height: '44px',
    fontSize: '16px',
    padding: '0 32px',
  },
};

const NotFound = () => {
  const history = useHistory();

  const handleGoHome = () => {
    history.push('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconWrapper}>
          <WarningOutlined style={styles.icon} />
        </div>
        <h1 style={styles.heading}>404</h1>
        <p style={styles.text}>Page Not Found</p>
        <p style={styles.description}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={handleGoHome}
          style={styles.button}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3a3b85';
            e.currentTarget.style.borderColor = '#3a3b85';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#45469D';
            e.currentTarget.style.borderColor = '#45469D';
          }}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
