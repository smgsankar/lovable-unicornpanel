import styles from './HomeScreen.module.css';

const HomeScreen = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Welcome to Lovable Admin Panel</h1>
      <h2 className={styles.subheading}>Your Modern Admin Dashboard</h2>
      <div className={styles.body}>
        <p>
          This is a powerful and intuitive admin panel built with modern web technologies. 
          Navigate through the sidebar to access different modules and manage your application 
          efficiently.
        </p>
        <p>
          The panel is designed specifically for the Bangladesh market with full support for 
          the Taka (৳) currency symbol and localized features.
        </p>
        <p>
          Use the collapsible sidebar to access different modules. Click on any module to 
          navigate to its dedicated screen. Modules with multiple submodules can be expanded 
          to reveal additional options.
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
