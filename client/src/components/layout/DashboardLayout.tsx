import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  theme,
  Button,
} from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  ImportOutlined,
  ExportOutlined,
  FileTextOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styled from "@emotion/styled";
import ThemeToggle from "./ThemeToggle";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useToken } = theme;

const StyledHeader = styled(Header)<{ token: any }>`
  background: ${(props) => props.token.colorBgContainer}CC !important;
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px dashed ${(props) => props.token.colorBorderSecondary};
`;

const StyledContent = styled(Content)<{ token: any }>`
  margin: 24px;
  padding: 24px;
  background: ${(props) => props.token.colorBgContainer};
  border-radius: 12px;
  min-height: calc(100vh - 112px);
  box-shadow: ${(props) =>
    props.token.mode === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.03)"};
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
  const { token } = useToken();
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
      key: "laporan",
      icon: <FileTextOutlined />,
      label: "Laporan",
      children: [
        {
          key: "/dashboard/laporan/kartu-stok",
          icon: <FileTextOutlined />,
          label: "Kartu Stok",
        },
        {
          key: "/dashboard/laporan/transaksi",
          icon: <FileTextOutlined />,
          label: "Laporan Transaksi",
        },
      ],
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
    if (path.startsWith("/dashboard/laporan")) {
      return ["laporan", path];
    }
    return [path];
  };

  const selectedKeys = getSelectedKeys();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        width={260}
        trigger={null}
        style={{
          borderRight: `1px dashed ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
        }}
      >
        <LogoContainer>
          <Logo>SI</Logo>
          {!collapsed && (
            <div>
              <div
                style={{
                  color: token.colorTextHeading,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Inventory
              </div>
              <div style={{ color: token.colorTextDescription, fontSize: 12 }}>
                Puskesmas
              </div>
            </div>
          )}
        </LogoContainer>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, background: "transparent" }}
        />
      </Sider>

      <Layout style={{ background: token.colorBgLayout }}>
        <StyledHeader token={token}>
          <Button
            type="text"
            icon={!collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Text strong style={{ color: token.colorTextHeading, fontSize: 18 }}>
            Sistem Inventory Management
          </Text>

          <Space size="middle">
            <ThemeToggle />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{ backgroundColor: token.colorPrimary }}
                  icon={<UserOutlined />}
                />
                {!collapsed && (
                  <Text style={{ color: token.colorText }}>
                    {user?.username || "User"}
                  </Text>
                )}
              </Space>
            </Dropdown>
          </Space>
        </StyledHeader>

        <StyledContent token={token}>
          <Outlet />
        </StyledContent>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
