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
import stockOutService from "../../api/stockOut";
import type { StockOut } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { formatDate } from "../../utils/formatters";
import dayjs from "dayjs";

import StockOutModal from "./StockOutModal";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const StockOutList: React.FC = () => {
  const [transactions, setTransactions] = useState<StockOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<StockOut | null>(null);
  const [editingItem, setEditingItem] = useState<StockOut | null>(null);
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
    destination?: string;
  }>({});

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await stockOutService.getAll(
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
        message.error("Failed to load stock out data");
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

  const handleViewDetails = async (record: StockOut) => {
    try {
      const fullData = await stockOutService.getById(record.id);
      setSelectedTransaction(fullData);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Failed to load transaction details");
    }
  };

  const handleEdit = (record: StockOut) => {
    setEditingItem(record);
    form.setFieldsValue({
      date: dayjs(record.date),
      destination: record.destination,
      description: record.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await stockOutService.delete(id);
      message.success("Transaction deleted successfully");
      fetchData();
    } catch (error) {
      message.error("Failed to delete transaction");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await stockOutService.update(editingItem.id, {
          date: values.date.format("YYYY-MM-DD"),
          destination: values.destination,
          description: values.description,
        });
        message.success("Transaction header updated successfully");
      } else {
        const formattedValues = {
          ...values,
          date: values.date.format("YYYY-MM-DD"),
          details: values.details || [],
        };
        await stockOutService.create(formattedValues);
        message.success("Stock out transaction created successfully");
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

  const columns: ColumnsType<StockOut> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Destination",
      dataIndex: "destination",
      key: "destination",
    },
    {
      title: "Recorded By",
      dataIndex: "username",
      key: "username",
      render: (text: string | undefined) => (
        <Tag color="green">{text || "-"}</Tag>
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
      render: (_: any, record: StockOut) => (
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
        items={[{ title: "Home" }, { title: "Stock Out Transactions" }]}
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
              Issue Stock
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

      <StockOutModal
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
        title="Transaction Details (Stock Out)"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={750}
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
                <Typography.Text type="secondary">Destination:</Typography.Text>
                <div>
                  <Typography.Text strong>
                    {selectedTransaction.destination}
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
                  title: "Quantity Issued",
                  dataIndex: "quantity",
                  key: "quantity",
                  align: "right",
                  render: (qty: number) => (
                    <Typography.Text strong>{qty}</Typography.Text>
                  ),
                },
              ]}
              dataSource={selectedTransaction.details}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </div>
        )}
      </Modal>
    </Space>
  );
};

export default StockOutList;
