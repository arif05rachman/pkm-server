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
  Tag,
  Space,
  Breadcrumb,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../api/auth";
import { formatDate } from "../../utils/formatters";
import styled from "@emotion/styled";

const { Title } = Typography;
const { useApp } = App;

const ProfileContainer = styled.div`
  width: 100%;
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
      await authService.updateProfile(values);
      await refreshUser();
      message.success("Profile updated successfully");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      await authService.changePassword(values);
      passwordForm.resetFields();
      message.success("Password changed successfully");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const tabItems = [
    {
      key: "profile",
      label: "Profile Information",
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
                rules={[{ required: true, message: "Username is required" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "password",
      label: "Change Password",
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Current password is required" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Current Password"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "New password is required" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Breadcrumb items={[{ title: "Home" }, { title: "User Profile" }]} />

      <ProfileContainer>
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
                <div style={{ fontWeight: "bold" }}>
                  <Tag color="gold">{user.role?.toUpperCase()}</Tag>
                </div>
              </Col>
              <Col span={12}>
                <Typography.Text type="secondary">Status:</Typography.Text>
                <div style={{ fontWeight: "bold" }}>
                  {user.is_active ? (
                    <Tag color="success">ACTIVE</Tag>
                  ) : (
                    <Tag color="error">INACTIVE</Tag>
                  )}
                </div>
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Typography.Text type="secondary">
                  Member Since:
                </Typography.Text>
                <div>{formatDate(user.created_at)}</div>
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Typography.Text type="secondary">
                  Last Updated:
                </Typography.Text>
                <div>{formatDate(user.updated_at)}</div>
              </Col>
            </Row>
          </div>
        </Card>
      </ProfileContainer>
    </Space>
  );
};

export default Profile;
