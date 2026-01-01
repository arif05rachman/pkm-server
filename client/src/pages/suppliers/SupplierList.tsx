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
  Card,
  Breadcrumb,
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
      fixed: "right",
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
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Breadcrumb
        items={[{ title: "Home" }, { title: "Supplier Management" }]}
      />

      <Card>
        <Row
          justify="space-between"
          gutter={[8, 8]}
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} md={12}>
            <Space.Compact style={{ width: "100%" }}>
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
          </Col>
          <Col>
            <Row justify="end" gutter={[8, 8]}>
              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() =>
                    fetchSuppliers(pagination.current, pagination.pageSize)
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
                  Add Supplier
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={suppliers}
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
                Total <b>{total}</b> suppliers
              </span>
            ),
            onChange: changePage,
          }}
        />
      </Card>

      <SupplierModal
        open={modalVisible}
        editingItem={editingItem}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </Space>
  );
};

export default SupplierList;
