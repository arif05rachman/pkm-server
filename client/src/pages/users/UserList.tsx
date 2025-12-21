import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
  Card,
  Select,
  Switch,
} from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { User } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { useUser } from "./useUser";

const { Title } = Typography;

const UserList: React.FC = () => {
  const {
    users,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchUsers,
    handleSearch,
    deleteUser,
    updateUser,
    addUser,
    changePage,
  } = useUser();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    // Default values for new user
    form.setFieldsValue({
      role: "user",
      is_active: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      role: record.role,
      is_active: record.is_active,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let success = false;
      if (editingUser) {
        success = await updateUser(editingUser.id, values);
      } else {
        success = await addUser(values);
      }

      if (success) {
        setModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "red";
      case "manager":
        return "blue";
      case "user":
        return "green";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{role.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Aktif" : "Tidak Aktif"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus user ini?"
            onConfirm={() => deleteUser(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Manajemen User</Title>
      <Row justify="end" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Space.Compact style={{ width: 250 }}>
              <Input
                placeholder="Cari user..."
                allowClear
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  // Optional: trigger fetch if cleared, though hook might auto-trigger
                  if (!e.target.value) {
                    // With the current hook implementation, clearing triggers update via effect
                  }
                }}
                onPressEnter={handleSearch}
              />
              <Button icon={<SearchOutlined />} onClick={handleSearch} />
            </Space.Compact>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tambah User
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} user`,
            onChange: (page, pageSize) => {
              changePage(page, pageSize);
            },
          }}
        />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Tambah User"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Username wajib diisi" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email wajib diisi" },
              { type: "email", message: "Format email tidak valid" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Password wajib diisi" },
                { min: 6, message: "Password minimal 6 karakter" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Role wajib diisi" }]}
          >
            <Select placeholder="Pilih Role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Aktif" unCheckedChildren="Tidak Aktif" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
