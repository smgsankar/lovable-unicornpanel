import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import styles from './MainLayout.module.css';
import logo from '@/assets/unicorn.png';

const { Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory();
  const location = useLocation();

  // Define menu items - modules with their submodules
  const menuItems: MenuItem[] = [
    {
      key: 'lovablehomemodule',
      label: 'Lovable Home',
      icon: <HomeOutlined />,
      path: '/lovablehomemodule/home',
    },
  ];

  const handleMenuClick = (path: string) => {
    history.push(path);
  };

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      const hasMultipleChildren = item.children && item.children.length >= 2;

      if (hasMultipleChildren) {
        // Collapsible submenu for modules with 2+ submodules
        return {
          key: item.key,
          label: item.label,
          icon: item.icon,
          children: item.children!.map((child) => ({
            key: child.key,
            label: child.label,
            onClick: () => handleMenuClick(child.path!),
          })),
        };
      } else {
        // Direct navigation for modules with 0-1 submodules
        return {
          key: item.key,
          label: item.label,
          icon: item.icon,
          onClick: () => handleMenuClick(item.path!),
        };
      }
    });
  };

  // Get active keys based on current route
  const getActiveKeys = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 1) {
      return pathSegments[0];
    }
    return '';
  };

  const getOpenKeys = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 1) {
      return [pathSegments[0]];
    }
    return [];
  };

  return (
    <Layout className={styles.layout}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        className={styles.sider}
        width={230}
      >
        {!collapsed && (
          <div className={styles.logoContainer}>
            <img src={logo} alt="Unicorn" className={styles.logo} />
          </div>
        )}

        <div className={styles.toggleButton} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[getActiveKeys()]}
          defaultOpenKeys={getOpenKeys()}
          items={renderMenuItems(menuItems)}
          className={styles.menu}
        />
      </Sider>

      <Layout className={styles.contentLayout}>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
