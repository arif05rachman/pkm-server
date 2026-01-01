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
  Card,
  Breadcrumb,
  Input,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { User } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { getStatusBadgeProps } from "../../utils/formatters";
import { useUsers } from "./useUsers";
import UserModal from "./UserModal";

const UserList: React.FC = () => {
  const {
    users,
    employees,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    handleSearch,
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
      fixed: "right",
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
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Breadcrumb items={[{ title: "Home" }, { title: "User Management" }]} />

      <Card>
        <Row
          justify="space-between"
          gutter={[8, 8]}
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} md={12}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Search by username or email..."
                allowClear
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined />}
              />
              <Button type="primary" onClick={handleSearch}>
                Search
              </Button>
            </Space.Compact>
          </Col>
          <Col>
            <Row justify="end" gutter={[8, 8]}>
              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() =>
                    fetchUsers(
                      pagination.current,
                      pagination.pageSize,
                      searchValue
                    )
                  }
                >
                  Refresh
                </Button>
              </Col>
            </Row>
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
            showTotal: (total) => (
              <span>
                Total <b>{total}</b> users
              </span>
            ),
            onChange: changePage,
          }}
        />
      </Card>

      <UserModal
        open={modalVisible}
        editingItem={editingItem}
        employees={employees}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </Space>
  );
};

export default UserList;
