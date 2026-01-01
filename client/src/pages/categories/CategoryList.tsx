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
} from "@ant-design/icons";
import type { Category } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { useCategories } from "./useCategories";
import CategoryModal from "./CategoryModal";

const { Title } = Typography;

const CategoryList: React.FC = () => {
  const {
    categories,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchCategories,
    handleSearch,
    deleteCategory,
    changePage,
    // Modal & Form
    modalVisible,
    editingItem,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  } = useCategories();

  const columns: ColumnsType<Category> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: Category) => (
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
            title="Are you sure you want to delete this category?"
            onConfirm={() => deleteCategory(record.id)}
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
      <Title level={2}>Category Management</Title>
      <Row justify="end" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space wrap>
            <Space.Compact style={{ width: 300 }}>
              <Input
                placeholder="Search categories..."
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
                fetchCategories(pagination.current, pagination.pageSize)
              }
            >
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Category
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} categories`,
          onChange: changePage,
        }}
      />

      <CategoryModal
        open={modalVisible}
        editingItem={editingItem}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};

export default CategoryList;
