import React from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { User } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { getStatusBadgeProps } from "../../utils/formatters";
import { useUsers } from "./useUsers";
import UserModal from "./UserModal";

const { Title } = Typography;

const UserList: React.FC = () => {
  const {
    users,
    employees,
    loading,
    pagination,
    fetchUsers,
    deleteUser,
    changePage,
    modalVisible,
    editingItem,
    form,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  } = useUsers();

  const columns: ColumnsType<User> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
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
      render: (role: string) => {
        let color = "blue";
        if (role === "admin") color = "gold";
        if (role === "manager") color = "cyan";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) => {
        const { text, status } = getStatusBadgeProps(active);
        return <Tag color={status === "success" ? "green" : "red"}>{text}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: User) => (
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
            title="Are you sure you want to delete this user?"
            onConfirm={() => deleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>User Management</Title>
      <Row justify="end" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchUsers(pagination.current, pagination.pageSize)}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
          onChange: changePage,
        }}
      />

      <UserModal
        open={modalVisible}
        editingItem={editingItem}
        employees={employees}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};

export default UserList;
