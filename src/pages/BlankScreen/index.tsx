import styles from './BlankScreen.module.css';

const BlankScreen = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.heading}>Welcome</h2>
        <p className={styles.text}>Select a module from the sidebar to get started</p>
      </div>
    </div>
  );
};

export default BlankScreen;
