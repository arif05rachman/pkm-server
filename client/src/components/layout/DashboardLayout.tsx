import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  UserOutlined,
  ProfileOutlined,
  UsergroupAddOutlined,
  FileTextOutlined,
  ImportOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from '@emotion/styled';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const StyledHeader = styled(Header)`
  background: #001529 !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
`;

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 112px);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  padding: 0 24px;
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
`;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/dashboard/barang',
      icon: <AppstoreOutlined />,
      label: 'Barang',
    },
    {
      key: '/dashboard/karyawan',
      icon: <TeamOutlined />,
      label: 'Karyawan',
    },
    {
      key: '/dashboard/supplier',
      icon: <ShoppingCartOutlined />,
      label: 'Supplier',
    },
    {
      key: '/dashboard/users',
      icon: <UsergroupAddOutlined />,
      label: 'Users',
    },
    {
      key: 'transaksi',
      icon: <ImportOutlined />,
      label: 'Transaksi',
      children: [
        {
          key: '/dashboard/transaksi-masuk',
          icon: <ImportOutlined />,
          label: 'Transaksi Masuk',
        },
        {
          key: '/dashboard/transaksi-keluar',
          icon: <ExportOutlined />,
          label: 'Transaksi Keluar',
        },
      ],
    },
    {
      key: '/dashboard/log-activity',
      icon: <FileTextOutlined />,
      label: 'Log Activity',
    },
    {
      key: '/dashboard/profile',
      icon: <ProfileOutlined />,
      label: 'Profil',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate('/dashboard/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Handle menu selection for nested routes
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard/transaksi-masuk') || path.startsWith('/dashboard/transaksi-keluar')) {
      return ['transaksi', path];
    }
    return [path];
  };

  const selectedKeys = getSelectedKeys();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        theme="dark"
      >
        <LogoContainer>
          <Logo>SI</Logo>
          {!collapsed && (
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                Inventory
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                Puskesmas
              </div>
            </div>
          )}
        </LogoContainer>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <StyledHeader>
          <Text strong style={{ color: 'white', fontSize: 18 }}>
            Sistem Inventory Management
          </Text>

          <Space>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  style={{ backgroundColor: '#1890ff' }}
                  icon={<UserOutlined />}
                />
                <Text style={{ color: 'white' }}>
                  {user?.username || 'User'}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </StyledHeader>

        <StyledContent>
          <Outlet />
        </StyledContent>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;

