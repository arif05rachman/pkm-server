import React from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Popconfirm,
  Typography,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import type { Supplier } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { useSuppliers } from "./useSuppliers";
import SupplierModal from "./SupplierModal";

const { Title } = Typography;

const SupplierList: React.FC = () => {
  const {
    suppliers,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchSuppliers,
    handleSearch,
    deleteSupplier,
    changePage,
    // Modal & Form
    modalVisible,
    editingItem,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  } = useSuppliers();

  const columns: ColumnsType<Supplier> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Space>
          <ShopOutlined />
          <Typography.Text strong>{text}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: Supplier) => (
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
            title="Are you sure you want to delete this supplier?"
            onConfirm={() => deleteSupplier(record.id)}
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
      <Title level={2}>Supplier Management</Title>
      <Row justify="end" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space wrap>
            <Space.Compact style={{ width: 300 }}>
              <Input
                placeholder="Search suppliers..."
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
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                fetchSuppliers(pagination.current, pagination.pageSize)
              }
            >
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Supplier
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={suppliers}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} suppliers`,
          onChange: changePage,
        }}
      />

      <SupplierModal
        open={modalVisible}
        editingItem={editingItem}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};

export default SupplierList;
