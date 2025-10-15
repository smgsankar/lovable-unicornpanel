import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
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

const styles: Record<string, React.CSSProperties> = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#F6F6F6',
  },
  sider: {
    backgroundColor: '#FFFFFF',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    height: '100vh',
    overflow: 'auto',
  },
  logoContainer: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderBottom: '1px solid #E6E6E6',
  },
  logo: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
  },
  toggleButton: {
    position: 'absolute',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: '#4D4D4D',
    zIndex: 10,
  },
  contentLayout: {
    backgroundColor: '#F6F6F6',
    marginLeft: '230px',
    transition: 'margin-left 0.2s',
  },
  contentLayoutCollapsed: {
    backgroundColor: '#F6F6F6',
    marginLeft: '80px',
    transition: 'margin-left 0.2s',
  },
};

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
    {
      key: 'udhsellermodule',
      label: 'Sellers',
      path: '/udhsellermodule/sellers',
    },
    {
      key: 'fmcgclaimmodule',
      label: 'FMCG Claim',
      children: [
        {
          key: 'fmcgclaimmodule-claimsubmission',
          label: 'Claim Submission',
          path: '/fmcgclaimmodule/claimsubmissionlist',
        },
      ],
    },
  ];

  const handleMenuClick = (path: string) => {
    history.push(path);
  };

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        // Collapsible submenu for modules with submodules
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
        // Direct navigation for modules without submodules
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
    const currentPath = location.pathname;
    
    // Check if any submenu item matches the current path
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.path === currentPath) {
            return child.key;
          }
        }
      }
      if (item.path === currentPath) {
        return item.key;
      }
    }
    
    // Fallback to first segment
    const pathSegments = currentPath.split('/').filter(Boolean);
    return pathSegments.length >= 1 ? pathSegments[0] : '';
  };

  const getOpenKeys = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 1) {
      return [pathSegments[0]];
    }
    return [];
  };

  return (
    <Layout style={styles.layout}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={styles.sider as React.CSSProperties}
        width={230}
      >
        {!collapsed && (
          <div style={styles.logoContainer}>
            <img src={logo} alt="Unicorn" style={styles.logo as React.CSSProperties} />
          </div>
        )}

        <div 
          style={styles.toggleButton as React.CSSProperties}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E6E6E6';
            e.currentTarget.style.color = '#45469D';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F6F6F6';
            e.currentTarget.style.color = '#4D4D4D';
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>

        {!collapsed && (
          <Menu
            mode="inline"
            selectedKeys={[getActiveKeys()]}
            defaultOpenKeys={getOpenKeys()}
            items={renderMenuItems(menuItems)}
            style={{
              borderRight: 'none',
              backgroundColor: 'transparent',
              marginTop: '16px',
              paddingBottom: '80px',
            }}
            theme="light"
          />
        )}
      </Sider>

      <Layout style={collapsed ? styles.contentLayoutCollapsed : styles.contentLayout}>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
