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
import type { Product } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { getTypeColor } from "../../utils/formatters";
import { useProducts } from "./useProducts";
import ProductModal from "./ProductModal";

const { Title } = Typography;

const ProductList: React.FC = () => {
  const {
    products,
    categories,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    isSearching,
    filters,
    handleSearch,
    handleFilterChange,
    fetchProducts,
    deleteProduct,
    changePage,
    // Modal & Form
    modalVisible,
    editingItem,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  } = useProducts();

  const columns: ColumnsType<Product> = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Typography.Text strong>{text}</Typography.Text>
      ),
    },
    {
      title: "Category",
      dataIndex: "category_name",
      key: "category_name",
      render: (category: string) => (
        <Tag color="blue">{category || "Uncategorized"}</Tag>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: any) => <Tag color={getTypeColor(type)}>{type}</Tag>,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      align: "right",
      render: (stock: number, record: Product) => (
        <Typography.Text
          type={stock <= record.min_stock ? "danger" : undefined}
          strong
        >
          {stock} {stock <= record.min_stock && "(Low)"}
        </Typography.Text>
      ),
    },
    {
      title: "Min Stock",
      dataIndex: "min_stock",
      key: "min_stock",
      align: "right",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: Product) => (
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
            title="Are you sure you want to delete this product?"
            onConfirm={() => deleteProduct(record.id)}
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
      <Title level={2}>Product Management</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Search by name or location..."
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

        <Col xs={24} md={16}>
          <Row justify="end" gutter={[8, 8]}>
            <Col>
              <Select
                placeholder="All Categories"
                style={{ width: 160 }}
                allowClear
                onChange={(val) => handleFilterChange({ category: val })}
                value={filters.category}
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="All Types"
                style={{ width: 160 }}
                allowClear
                onChange={(val) => handleFilterChange({ type: val })}
                value={filters.type}
              >
                <Select.Option value="Medicine">Medicine</Select.Option>
                <Select.Option value="Medical Device">
                  Medical Device
                </Select.Option>
                <Select.Option value="Medical Material">
                  Medical Material
                </Select.Option>
              </Select>
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchProducts(
                    pagination.current,
                    pagination.pageSize,
                    isSearching ? searchValue : "",
                    filters
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
                Add Product
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} products`,
          onChange: changePage,
        }}
      />

      <ProductModal
        open={modalVisible}
        editingItem={editingItem}
        categories={categories}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};

export default ProductList;
