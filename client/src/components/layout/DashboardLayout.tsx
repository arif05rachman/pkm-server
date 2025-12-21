import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  FileTextOutlined,
  ImportOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styled from "@emotion/styled";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const StyledHeader = styled(Header)`
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  min-height: calc(100vh - 112px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 20px 0;
  padding: 0 24px;
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00a76f 0%, #007867 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
  box-shadow: 0 4px 8px rgba(0, 167, 111, 0.24);
`;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/dashboard/karyawan",
      icon: <TeamOutlined />,
      label: "Master Karyawan",
    },
    {
      key: "/dashboard/users",
      icon: <UsergroupAddOutlined />,
      label: "Master Users",
    },
    {
      key: "/dashboard/barang",
      icon: <AppstoreOutlined />,
      label: "Master Barang",
    },
    {
      key: "/dashboard/supplier",
      icon: <ShoppingCartOutlined />,
      label: "Master Supplier",
    },
    {
      key: "transaksi",
      icon: <ImportOutlined />,
      label: "Transaksi",
      children: [
        {
          key: "/dashboard/transaksi-masuk",
          icon: <ImportOutlined />,
          label: "Transaksi Masuk",
        },
        {
          key: "/dashboard/transaksi-keluar",
          icon: <ExportOutlined />,
          label: "Transaksi Keluar",
        },
      ],
    },
    {
      key: "/dashboard/log-activity",
      icon: <FileTextOutlined />,
      label: "Log Activity",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil",
      onClick: () => navigate("/dashboard/profile"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Handle menu selection for nested routes
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (
      path.startsWith("/dashboard/transaksi-masuk") ||
      path.startsWith("/dashboard/transaksi-keluar")
    ) {
      return ["transaksi", path];
    }
    return [path];
  };

  const selectedKeys = getSelectedKeys();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        theme="light"
        style={{
          borderRight: "1px dashed rgba(145, 158, 171, 0.24)",
          background: "#fff",
        }}
      >
        <LogoContainer>
          <Logo>SI</Logo>
          {!collapsed && (
            <div>
              <div
                style={{ color: "#212B36", fontWeight: "bold", fontSize: 16 }}
              >
                Inventory
              </div>
              <div style={{ color: "#637381", fontSize: 12 }}>Puskesmas</div>
            </div>
          )}
        </LogoContainer>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ background: "#F4F6F8" }}>
        <StyledHeader>
          <Text strong style={{ color: "#212B36", fontSize: 18 }}>
            Sistem Inventory Management
          </Text>

          <Space>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{ backgroundColor: "#00A76F" }}
                  icon={<UserOutlined />}
                />
                <Text style={{ color: "#212B36" }}>
                  {user?.username || "User"}
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
