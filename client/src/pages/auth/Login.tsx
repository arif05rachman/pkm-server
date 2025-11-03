import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Divider } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styled from "@emotion/styled";

const { Title, Text } = Typography;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
    <LoginContainer>
      <LoginCard>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Sistem Inventory
          </Title>
          <Text type="secondary">Silakan login untuk melanjutkan</Text>
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
              prefix={<UserOutlined />}
              placeholder="Username"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password wajib diisi!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            Default: admin / admin123
          </Text>
        </Divider>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary">
            Puskesmas Inventory Management System v1.0
          </Text>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
