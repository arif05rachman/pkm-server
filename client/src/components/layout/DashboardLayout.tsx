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
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TagsOutlined,
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
  min-height: calc(100vh - 112px);
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
      key: "/dashboard/employees",
      icon: <TeamOutlined />,
      label: "Employees",
    },
    {
      key: "/dashboard/users",
      icon: <UsergroupAddOutlined />,
      label: "Users",
    },
    {
      key: "products_master",
      icon: <AppstoreOutlined />,
      label: "Product Master",
      children: [
        {
          key: "/dashboard/products",
          icon: <AppstoreOutlined />,
          label: "Products",
        },
        {
          key: "/dashboard/categories",
          icon: <TagsOutlined />,
          label: "Categories",
        },
      ],
    },
    {
      key: "/dashboard/suppliers",
      icon: <ShoppingCartOutlined />,
      label: "Suppliers",
    },
    {
      key: "transactions",
      icon: <ImportOutlined />,
      label: "Transactions",
      children: [
        {
          key: "/dashboard/stock-in",
          icon: <ImportOutlined />,
          label: "Stock In",
        },
        {
          key: "/dashboard/stock-out",
          icon: <ExportOutlined />,
          label: "Stock Out",
        },
      ],
    },
    {
      key: "reports",
      icon: <FileTextOutlined />,
      label: "Reports",
      children: [
        {
          key: "/dashboard/reports/stock-card",
          icon: <FileTextOutlined />,
          label: "Stock Card",
        },
        {
          key: "/dashboard/reports/transactions",
          icon: <FileTextOutlined />,
          label: "Transaction History",
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
      label: "Profile",
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
      path.startsWith("/dashboard/stock-in") ||
      path.startsWith("/dashboard/stock-out")
    ) {
      return ["transactions", path];
    }
    if (path.startsWith("/dashboard/reports")) {
      return ["reports", path];
    }
    if (
      path.startsWith("/dashboard/products") ||
      path.startsWith("/dashboard/categories")
    ) {
      return ["products_master", path];
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
            Inventory Management System
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
