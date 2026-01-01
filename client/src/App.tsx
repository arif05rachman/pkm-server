import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp, Spin } from "antd";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/auth/Login";

import DashboardLayout from "./components/layout/DashboardLayout";
import "dayjs/locale/en";

import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { getThemeConfig } from "./utils/theme";

// Lazy load pages for better code splitting
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const ProductList = lazy(() => import("./pages/products/ProductList"));
const CategoryList = lazy(() => import("./pages/categories/CategoryList"));
const EmployeeList = lazy(() => import("./pages/employees/EmployeeList"));
const SupplierList = lazy(() => import("./pages/suppliers/SupplierList"));
const UserList = lazy(() => import("./pages/users/UserList"));
const StockInList = lazy(() => import("./pages/transactions/StockInList"));
const StockOutList = lazy(() => import("./pages/transactions/StockOutList"));
const StockCard = lazy(() => import("./pages/reports/StockCard"));
const TransactionHistory = lazy(
  () => import("./pages/reports/TransactionHistory")
);
const Profile = lazy(() => import("./pages/profile/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <Spin size="large" tip="Loading..." />
  </div>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppContent: React.FC = () => {
  const { mode } = useTheme();

  return (
    <ConfigProvider theme={getThemeConfig(mode)}>
      <AntdApp>
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
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="products"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProductList />
                  </Suspense>
                }
              />
              <Route
                path="categories"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CategoryList />
                  </Suspense>
                }
              />
              <Route
                path="employees"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EmployeeList />
                  </Suspense>
                }
              />
              <Route
                path="suppliers"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SupplierList />
                  </Suspense>
                }
              />
              <Route
                path="users"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <UserList />
                  </Suspense>
                }
              />
              <Route
                path="stock-in"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <StockInList />
                  </Suspense>
                }
              />
              <Route
                path="stock-out"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <StockOutList />
                  </Suspense>
                }
              />
              <Route
                path="reports/stock-card"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <StockCard />
                  </Suspense>
                }
              />
              <Route
                path="reports/transaction-history"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TransactionHistory />
                  </Suspense>
                }
              />
              <Route
                path="profile"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Profile />
                  </Suspense>
                }
              />
            </Route>
            <Route
              path="*"
              element={
                <Suspense fallback={<PageLoader />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
