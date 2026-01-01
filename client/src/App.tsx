import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/auth/Login";

import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ProductList from "./pages/products/ProductList";
import CategoryList from "./pages/categories/CategoryList";
import EmployeeList from "./pages/employees/EmployeeList";
import SupplierList from "./pages/suppliers/SupplierList";
import UserList from "./pages/users/UserList";
import StockInList from "./pages/transactions/StockInList";
import StockOutList from "./pages/transactions/StockOutList";
import StockCard from "./pages/reports/StockCard";
import TransactionHistory from "./pages/reports/TransactionHistory";
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";
import "dayjs/locale/en";

import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { getThemeConfig } from "./utils/theme";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: "center", padding: 50 }}>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: "center", padding: 50 }}>Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppContent: React.FC = () => {
  const { mode } = useTheme();

  return (
    <ConfigProvider theme={getThemeConfig(mode)}>
      <AntdApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route path="/404" element={<NotFound />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductList />} />
                <Route path="categories" element={<CategoryList />} />
                <Route path="employees" element={<EmployeeList />} />
                <Route path="suppliers" element={<SupplierList />} />
                <Route path="users" element={<UserList />} />

                <Route path="stock-in" element={<StockInList />} />
                <Route path="stock-out" element={<StockOutList />} />
                <Route path="reports/stock-card" element={<StockCard />} />
                <Route
                  path="reports/transactions"
                  element={<TransactionHistory />}
                />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
