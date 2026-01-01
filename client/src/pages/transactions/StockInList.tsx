import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  App,
  Popconfirm,
  Typography,
  Row,
  Col,
  DatePicker,
  Tag,
  Card,
  Breadcrumb,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import stockInService from "../../api/stockIn";
import type { StockIn } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { formatDate, formatCurrency } from "../../utils/formatters";
import dayjs from "dayjs";

import StockInModal from "./StockInModal";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const StockInList: React.FC = () => {
  const [transactions, setTransactions] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<StockIn | null>(null);
  const [editingItem, setEditingItem] = useState<StockIn | null>(null);
  const [form] = Form.useForm();
  const [formFilter] = Form.useForm();
  const { message } = App.useApp();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    supplier_id?: number;
  }>({});

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await stockInService.getAll(
        pagination.current,
        pagination.pageSize,
        filters
      );
      setTransactions(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        message.error("Failed to load stock in data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      });
      setPagination((prev) => ({ ...prev, current: 1 }));
    } else {
      const newFilters = { ...filters };
      delete newFilters.startDate;
      delete newFilters.endDate;
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }
  };

  const handleViewDetails = async (record: StockIn) => {
    try {
      const fullData = await stockInService.getById(record.id);
      setSelectedTransaction(fullData);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Failed to load transaction details");
    }
  };

  const handleEdit = (record: StockIn) => {
    setEditingItem(record);
    form.setFieldsValue({
      date: dayjs(record.date),
      supplier_id: record.supplier_id,
      description: record.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await stockInService.delete(id);
      message.success("Transaction deleted successfully");
      fetchData();
    } catch (error) {
      message.error("Failed to delete transaction");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await stockInService.update(editingItem.id, {
          date: values.date.format("YYYY-MM-DD"),
          supplier_id: values.supplier_id,
          description: values.description,
        });
        message.success("Transaction header updated successfully");
      } else {
        const formattedValues = {
          ...values,
          date: values.date.format("YYYY-MM-DD"),
          details:
            values.details?.map((d: any) => ({
              ...d,
              expiry_date: d.expiry_date
                ? d.expiry_date.format("YYYY-MM-DD")
                : null,
            })) || [],
        };
        await stockInService.create(formattedValues);
        message.success("Stock in transaction created successfully");
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to save transaction"
      );
    }
  };

  const columns: ColumnsType<StockIn> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Supplier",
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (text: string | undefined) => text || "-",
    },
    {
      title: "Recorded By",
      dataIndex: "username",
      key: "username",
      render: (text: string | undefined) => (
        <Tag color="blue">{text || "-"}</Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "-",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "action",
      fixed: "right",
      render: (_: any, record: StockIn) => (
        <Space size="middle">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this transaction?"
            onConfirm={() => handleDelete(record.id)}
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
        items={[{ title: "Home" }, { title: "Stock In Transactions" }]}
      />

      <Card>
        <Form form={formFilter} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item name="dateRange" label="Date Range">
                <RangePicker
                  onChange={handleDateRangeChange}
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Row justify="end" gutter={[8, 8]} style={{ marginBottom: 16 }}>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add New Transaction
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={transactions}
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
                Total <b>{total}</b> transactions
              </span>
            ),
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
              }));
            },
          }}
        />
      </Card>

      <StockInModal
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        form={form}
        loading={loading}
      />

      <Modal
        title="Transaction Details (Stock In)"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={850}
      >
        {selectedTransaction && (
          <div>
            <Row
              gutter={[16, 16]}
              style={{
                marginBottom: 24,
                padding: "16px",
                background: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <Col span={12}>
                <Typography.Text type="secondary">Date:</Typography.Text>
                <div>
                  <Typography.Text strong>
                    {formatDate(selectedTransaction.date)}
                  </Typography.Text>
                </div>
              </Col>
              <Col span={12}>
                <Typography.Text type="secondary">Supplier:</Typography.Text>
                <div>
                  <Typography.Text strong>
                    {selectedTransaction.supplier_name || "-"}
                  </Typography.Text>
                </div>
              </Col>
              <Col span={12}>
                <Typography.Text type="secondary">Recorded By:</Typography.Text>
                <div>
                  <Typography.Text strong>
                    {selectedTransaction.username || "-"}
                  </Typography.Text>
                </div>
              </Col>
              {selectedTransaction.description && (
                <Col span={24}>
                  <Typography.Text type="secondary">Notes:</Typography.Text>
                  <div>
                    <Typography.Text>
                      {selectedTransaction.description}
                    </Typography.Text>
                  </div>
                </Col>
              )}
            </Row>

            <Title level={4}>Item Details</Title>
            <Table
              columns={[
                {
                  title: "Product Item",
                  dataIndex: "product_name",
                  key: "product_name",
                  render: (text) => (
                    <Typography.Text strong>{text}</Typography.Text>
                  ),
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                  key: "quantity",
                  align: "right",
                  render: (qty: number) => (
                    <Typography.Text>{qty}</Typography.Text>
                  ),
                },
                {
                  title: "Unit Price",
                  dataIndex: "unit_price",
                  key: "unit_price",
                  align: "right",
                  render: (price: number) => formatCurrency(price),
                },
                {
                  title: "Subtotal",
                  key: "total",
                  align: "right",
                  render: (_: any, record: any) => (
                    <Typography.Text strong>
                      {formatCurrency(record.quantity * record.unit_price)}
                    </Typography.Text>
                  ),
                },
                {
                  title: "Expiry Date",
                  dataIndex: "expiry_date",
                  key: "expiry_date",
                  render: (date: string | null) =>
                    date ? (
                      formatDate(date, "DD/MM/YYYY")
                    ) : (
                      <Typography.Text type="secondary">None</Typography.Text>
                    ),
                },
              ]}
              dataSource={selectedTransaction.details}
              rowKey="id"
              pagination={false}
              size="middle"
              scroll={{ x: "max-content" }}
            />

            <Row justify="end" style={{ marginTop: 24 }}>
              <Col>
                <Title level={4}>
                  Grand Total:{" "}
                  {formatCurrency(
                    selectedTransaction.details?.reduce(
                      (acc, curr) => acc + curr.quantity * curr.unit_price,
                      0
                    ) || 0
                  )}
                </Title>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Space>
  );
};

export default StockInList;
