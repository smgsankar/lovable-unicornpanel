const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heading: {
    color: '#1A1A1A',
    fontSize: '32px',
    fontWeight: 600,
    marginBottom: '8px',
    lineHeight: 1.3,
  },
  subheading: {
    color: '#45469D',
    fontSize: '20px',
    fontWeight: 500,
    marginBottom: '24px',
    lineHeight: 1.4,
  },
  body: {
    color: '#4D4D4D',
    fontSize: '16px',
    lineHeight: 1.6,
  },
  paragraph: {
    marginBottom: '16px',
  },
};

const HomeScreen = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to Lovable Admin Panel</h1>
      <h2 style={styles.subheading}>Your Modern Admin Dashboard</h2>
      <div style={styles.body}>
        <p style={styles.paragraph}>
          This is a powerful and intuitive admin panel built with modern web technologies. 
          Navigate through the sidebar to access different modules and manage your application 
          efficiently.
        </p>
        <p style={styles.paragraph}>
          The panel is designed specifically for the Bangladesh market with full support for 
          the Taka (৳) currency symbol and localized features.
        </p>
        <p style={{ marginBottom: 0 }}>
          Use the collapsible sidebar to access different modules. Click on any module to 
          navigate to its dedicated screen. Modules with multiple submodules can be expanded 
          to reveal additional options.
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
