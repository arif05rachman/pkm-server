import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { defaultTheme } from "./utils/theme";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import BarangList from "./pages/barang/BarangList";
import KaryawanList from "./pages/karyawan/KaryawanList";
import SupplierList from "./pages/supplier/SupplierList";
import UserList from "./pages/users/UserList";
import LogActivityList from "./pages/logActivity/LogActivityList";
import TransaksiMasukList from "./pages/transaksi/TransaksiMasukList";
import TransaksiKeluarList from "./pages/transaksi/TransaksiKeluarList";
import Profile from "./pages/profile/Profile";
import "dayjs/locale/id";
import "@ant-design/v5-patch-for-react-19";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: "center", padding: 50 }}>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={defaultTheme}>
      <AntdApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="barang" element={<BarangList />} />
                <Route path="karyawan" element={<KaryawanList />} />
                <Route path="supplier" element={<SupplierList />} />
                <Route path="users" element={<UserList />} />
                <Route path="log-activity" element={<LogActivityList />} />
                <Route
                  path="transaksi-masuk"
                  element={<TransaksiMasukList />}
                />
                <Route
                  path="transaksi-keluar"
                  element={<TransaksiKeluarList />}
                />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
