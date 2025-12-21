import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  App,
  theme,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styled from "@emotion/styled";

const { Title, Text } = Typography;
const { useApp } = App;
const { useToken } = theme;

const LoginContainer = styled.div<{ token: any }>`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.token.colorBgLayout};
  background-image: ${(props) =>
    props.token.mode === "dark"
      ? "none"
      : `linear-gradient(135deg, ${props.token.colorPrimaryBg} 0%, ${props.token.colorPrimaryBg} 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300a76f' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`};
  padding: 20px;
`;

const LoginCard = styled(Card)<{ token: any }>`
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: ${(props) =>
    props.token.mode === "dark" ? "none" : "0 8px 24px rgba(0, 0, 0, 0.15)"};
  background: ${(props) => props.token.colorBgContainer};
`;

const Login: React.FC = () => {
  const { token } = useToken();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message } = useApp();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success("Login berhasil!");
      navigate("/dashboard");
    } catch (error: unknown) {
      let errorMessage = "Login gagal. Silakan coba lagi.";
      if (error && typeof error === "object" && "response" in error) {
        const response = (
          error as { response?: { data?: { message?: string } } }
        ).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer token={token}>
      <LoginCard token={token}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title
            level={2}
            style={{ marginBottom: 8, color: token.colorTextHeading }}
          >
            Sistem Inventory
          </Title>
          <Text type="secondary" style={{ color: token.colorTextDescription }}>
            Silakan login untuk melanjutkan
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Username wajib diisi!" }]}
          >
            <Input
              prefix={
                <UserOutlined style={{ color: token.colorTextDisabled }} />
              }
              placeholder="Username"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password wajib diisi!" }]}
          >
            <Input.Password
              prefix={
                <LockOutlined style={{ color: token.colorTextDisabled }} />
              }
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text
            type="secondary"
            style={{ fontSize: 12, color: token.colorTextDescription }}
          >
            Default: admin / admin123
          </Text>
        </Divider>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary" style={{ color: token.colorTextDescription }}>
            Puskesmas Inventory Management System v1.0
          </Text>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
