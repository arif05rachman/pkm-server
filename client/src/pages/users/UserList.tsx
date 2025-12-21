import React from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
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
import UserModal from "./UserModal";

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
    changePage,
    // Modal & Form
    modalVisible,
    editingUser,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  } = useUser();

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
      width: 150,
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
                onChange={(e) => setSearchValue(e.target.value)}
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
          onChange: changePage,
        }}
      />

      <UserModal
        open={modalVisible}
        editingUser={editingUser}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};

export default UserList;
