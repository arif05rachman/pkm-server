import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  App,
  Avatar,
  Divider,
  Row,
  Col,
  Tabs,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/auth";
import { formatDate } from "../../utils/formatters";
import styled from "@emotion/styled";

const { Title } = Typography;
const { useApp } = App;

const ProfileContainer = styled.div`
  .profile-header {
    text-align: center;
    padding: 32px 0;
  }
`;

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = useApp();

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      await authApi.updateProfile(values);
      await refreshUser();
      message.success("Profil berhasil diupdate");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Gagal mengupdate profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      await authApi.changePassword(values);
      passwordForm.resetFields();
      message.success("Password berhasil diubah");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const tabItems = [
    {
      key: "profile",
      label: "Informasi Profil",
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={{
            username: user.username,
            email: user.email,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Username wajib diisi" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email wajib diisi" },
                  { type: "email", message: "Format email tidak valid" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Simpan Perubahan
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "password",
      label: "Ubah Password",
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Password Saat Ini"
            rules={[
              { required: true, message: "Password saat ini wajib diisi" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password Saat Ini"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Password Baru"
            rules={[
              { required: true, message: "Password baru wajib diisi" },
              { min: 8, message: "Password minimal 8 karakter" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password Baru"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Ubah Password
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <ProfileContainer>
      <Title level={2}>Profil Pengguna</Title>

      <Card>
        <div className="profile-header">
          <Avatar size={100} icon={<UserOutlined />} />
          <Title level={3} style={{ marginTop: 16 }}>
            {user.username}
          </Title>
          <Typography.Text type="secondary">{user.email}</Typography.Text>
        </div>

        <Divider />

        <Tabs defaultActiveKey="profile" items={tabItems} />

        <Divider />

        <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Typography.Text type="secondary">Role:</Typography.Text>
              <div style={{ fontWeight: "bold" }}>{user.role}</div>
            </Col>
            <Col span={12}>
              <Typography.Text type="secondary">Status:</Typography.Text>
              <div style={{ fontWeight: "bold" }}>
                {user.is_active ? "Aktif" : "Tidak Aktif"}
              </div>
            </Col>
            <Col span={12} style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">Terdaftar:</Typography.Text>
              <div>{formatDate(user.created_at)}</div>
            </Col>
            <Col span={12} style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">
                Terakhir Diupdate:
              </Typography.Text>
              <div>{formatDate(user.updated_at)}</div>
            </Col>
          </Row>
        </div>
      </Card>
    </ProfileContainer>
  );
};

export default Profile;
