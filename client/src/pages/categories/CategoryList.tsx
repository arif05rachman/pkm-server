import React from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Popconfirm,
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
} from "@ant-design/icons";
import type { Category } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { useCategories } from "./useCategories";
import CategoryModal from "./CategoryModal";

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
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Breadcrumb
        items={[{ title: "Home" }, { title: "Category Management" }]}
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
          </Col>
          <Col>
            <Row justify="end" gutter={[8, 8]}>
              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() =>
                    fetchCategories(pagination.current, pagination.pageSize)
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
                  Add Category
                </Button>
              </Col>
            </Row>
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
            showTotal: (total) => (
              <span>
                Total <b>{total}</b> categories
              </span>
            ),
            onChange: changePage,
          }}
        />
      </Card>

      <CategoryModal
        open={modalVisible}
        editingItem={editingItem}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </Space>
  );
};

export default CategoryList;
