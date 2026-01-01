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
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { Employee } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { getStatusBadgeProps } from "../../utils/formatters";
import { useEmployees } from "./useEmployees";
import EmployeeModal from "./EmployeeModal";

const { Title } = Typography;

const EmployeeList: React.FC = () => {
  const {
    employees,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    activeFilter,
    handleSearch,
    handleStatusFilter,
    fetchEmployees,
    deleteEmployee,
    changePage,
    // Modal & Form
    modalVisible,
    editingItem,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  } = useEmployees();

  const columns: ColumnsType<Employee> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Typography.Text strong>{text}</Typography.Text>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "NIP",
      dataIndex: "nip",
      key: "nip",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
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
      render: (_: any, record: Employee) => (
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
            title="Are you sure you want to delete this employee?"
            onConfirm={() => deleteEmployee(record.id)}
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
      <Title level={2}>Employee Management</Title>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 24 }}
        gutter={[16, 16]}
      >
        <Col xs={24} md={12}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Search by name, NIP, or phone..."
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
        <Col xs={24} md={12}>
          <Row justify="end" gutter={[8, 8]}>
            <Col>
              <Select
                value={activeFilter}
                onChange={handleStatusFilter}
                style={{ width: 120 }}
                placeholder="All Status"
                allowClear
              >
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchEmployees(
                    pagination.current,
                    pagination.pageSize,
                    searchValue,
                    activeFilter
                  )
                }
              >
                Refresh
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add Employee
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} employees`,
          onChange: changePage,
        }}
      />

      <EmployeeModal
        open={modalVisible}
        editingItem={editingItem}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};

export default EmployeeList;
