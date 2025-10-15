const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  content: {
    textAlign: 'center',
  },
  heading: {
    color: '#1A1A1A',
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  text: {
    color: '#4D4D4D',
    fontSize: '16px',
  },
};

const BlankScreen = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.heading}>Welcome</h2>
        <p style={styles.text}>Select a module from the sidebar to get started</p>
      </div>
    </div>
  );
};

export default BlankScreen;
