import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Select,
  DatePicker,
  Table,
  Row,
  Col,
  Statistic,
  Empty,
  App,
  Tag,
  Space,
  Breadcrumb,
} from "antd";
import reportService from "../../api/report";
import productService from "../../api/product";
import { formatDate } from "../../utils/formatters";
import type { Product } from "../../types";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface StockMovement {
  type: "masuk" | "keluar"; // "masuk" maps to "IN", "keluar" maps to "OUT" on backend if not standardized yet
  date: string;
  description: string | null;
  quantity: number;
  operator: string | null;
}

const StockCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [reportData, setReportData] = useState<{
    product: Product;
    period: { start: string; end: string };
    movements: StockMovement[];
  } | null>(null);
  const { message } = App.useApp();

  useEffect(() => {
    fetchProductList();
  }, []);

  useEffect(() => {
    if (selectedProduct && dates) {
      fetchReport();
    }
  }, [selectedProduct, dates]);

  const fetchProductList = async () => {
    try {
      const data = await productService.getAll(1, 1000);
      setProductList(data.data);
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  const fetchReport = async () => {
    if (!selectedProduct || !dates) return;

    setLoading(true);
    try {
      const data = await reportService.getStockCard(
        selectedProduct,
        dates[0].format("YYYY-MM-DD"),
        dates[1].format("YYYY-MM-DD")
      );
      // Backend might return Indonesian keys, mapping them here if necessary
      // Assuming backend service was updated to product and movements
      setReportData(data);
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to load stock card"
      );
    } finally {
      setLoading(false);
    }
  };

  const dataSource = reportData ? reportData.movements : [];

  const columns: ColumnsType<StockMovement> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Text type={type === "masuk" ? "success" : "danger"} strong>
          {type === "masuk" ? "IN" : "OUT"}
        </Text>
      ),
    },
    {
      title: "Incoming",
      dataIndex: "quantity",
      key: "in",
      align: "right",
      render: (val, record) => (record.type === "masuk" ? val : "-"),
    },
    {
      title: "Outgoing",
      dataIndex: "quantity",
      key: "out",
      align: "right",
      render: (val, record) => (record.type === "keluar" ? val : "-"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Operator",
      dataIndex: "operator",
      key: "operator",
      render: (text) => <Tag color="blue">{text || "-"}</Tag>,
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Breadcrumb items={[{ title: "Home" }, { title: "Stock Card Report" }]} />

      <Card title="Filter">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Text strong>Select Product:</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              showSearch
              placeholder="Search Product..."
              optionFilterProp="children"
              onChange={setSelectedProduct}
              value={selectedProduct}
            >
              {productList.map((b) => (
                <Select.Option key={b.id} value={b.id}>
                  {b.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>Period:</Text>
            <br />
            <RangePicker
              style={{ width: "100%", marginTop: 8 }}
              value={dates}
              onChange={(val) => setDates(val as any)}
              format="YYYY-MM-DD"
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>

      {reportData ? (
        <Card title={`Stock Card: ${reportData.product.name}`}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="Total Stock In"
                value={dataSource
                  .filter((m) => m.type === "masuk")
                  .reduce((acc, curr) => acc + curr.quantity, 0)}
                styles={{ content: { color: "#3f8600" } }}
                suffix={reportData.product.unit}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Stock Out"
                value={dataSource
                  .filter((m) => m.type === "keluar")
                  .reduce((acc, curr) => acc + curr.quantity, 0)}
                styles={{ content: { color: "#cf1322" } }}
                suffix={reportData.product.unit}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Grand Total Delta"
                value={dataSource.reduce(
                  (acc, curr) =>
                    acc +
                    (curr.type === "masuk" ? curr.quantity : -curr.quantity),
                  0
                )}
                suffix={reportData.product.unit}
              />
            </Col>
          </Row>

          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey={(r) => r.date + r.type + r.quantity}
            pagination={false}
            loading={loading}
            scroll={{ x: "max-content" }}
          />
        </Card>
      ) : (
        <Card>
          <Empty description="Please select a product to view the stock card" />
        </Card>
      )}
    </Space>
  );
};

export default StockCard;
