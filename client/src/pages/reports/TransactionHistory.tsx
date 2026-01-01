import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Table,
  Space,
  Row,
  Col,
  Statistic,
  App,
  DatePicker,
  Radio,
  Tag,
  Breadcrumb,
} from "antd";

import reportService from "../../api/report";
import { formatDate, formatCurrency } from "../../utils/formatters";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface TransactionDetail {
  type: "masuk" | "keluar"; // "masuk" maps to "IN", "keluar" maps to "OUT"
  date: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  product_name: string;
  unit: string;
  source_destination: string | null; // supplier or destination
  operator: string;
  id: number;
}

const TransactionHistory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"monthly" | "yearly" | "custom">(
    "monthly"
  );
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());
  const [selectedYear, setSelectedYear] = useState<dayjs.Dayjs>(dayjs());
  const [customRange, setCustomRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  const [data, setData] = useState<{
    period: { start: string; end: string };
    transactions: TransactionDetail[];
  } | null>(null);

  const { message } = App.useApp();

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedMonth, selectedYear, customRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let params: any = {};
      if (reportType === "monthly") {
        params.month = selectedMonth.month() + 1;
        params.year = selectedMonth.year();
      } else if (reportType === "yearly") {
        params.year = selectedYear.year();
      } else {
        params.startDate = customRange[0].format("YYYY-MM-DD");
        params.endDate = customRange[1].format("YYYY-MM-DD");
      }

      const result = await reportService.getAllTransactions(params);
      setData(result.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<TransactionDetail> = [
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
        <Tag color={type === "masuk" ? "success" : "volcano"}>
          {type === "masuk" ? "STOCK IN" : "STOCK OUT"}
        </Tag>
      ),
    },
    {
      title: "Product",
      key: "product",
      render: (_, record) => <Text strong>{record.product_name}</Text>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (val, record) => `${val} ${record.unit}`,
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      align: "right",
      render: (val, record) =>
        record.type === "masuk" ? formatCurrency(val) : "-",
    },
    {
      title: "Subtotal",
      key: "total",
      align: "right",
      render: (_, record) =>
        record.type === "masuk"
          ? formatCurrency(record.quantity * record.unit_price)
          : "-",
    },
    {
      title: "Source/Destination",
      dataIndex: "source_destination",
      key: "source_destination",
      render: (val) => val || "-",
    },
    {
      title: "Recorded By",
      dataIndex: "operator",
      key: "operator",
    },
  ];

  const totalStockInValue =
    data?.transactions
      .filter((t) => t.type === "masuk")
      .reduce((acc, curr) => acc + curr.quantity * curr.unit_price, 0) || 0;

  return (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Breadcrumb
        items={[{ title: "Home" }, { title: "Transaction History Report" }]}
      />

      <Card title="Filter">
        <Row align="middle" gutter={[16, 16]}>
          <Col>
            <Radio.Group
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <Radio.Button value="monthly">Monthly</Radio.Button>
              <Radio.Button value="yearly">Yearly</Radio.Button>
              <Radio.Button value="custom">Custom Range</Radio.Button>
            </Radio.Group>
          </Col>
          <Col>
            {reportType === "monthly" && (
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(val) => val && setSelectedMonth(val)}
                allowClear={false}
              />
            )}
            {reportType === "yearly" && (
              <DatePicker
                picker="year"
                value={selectedYear}
                onChange={(val) => val && setSelectedYear(val)}
                allowClear={false}
              />
            )}
            {reportType === "custom" && (
              <RangePicker
                value={customRange}
                onChange={(val) => val && setCustomRange([val[0]!, val[1]!])}
                allowClear={false}
              />
            )}
          </Col>
        </Row>
      </Card>

      {data && (
        <Card title="Report Summary">
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={8}>
              <Statistic
                title="Total Stock In Value"
                value={totalStockInValue}
                formatter={(value) => formatCurrency(Number(value))}
                styles={{ content: { color: "#3f8600" } }}
              />
            </Col>
            <Col xs={12} md={8}>
              <Statistic
                title="Received Items"
                value={
                  data.transactions.filter((t) => t.type === "masuk").length
                }
              />
            </Col>
            <Col xs={12} md={8}>
              <Statistic
                title="Issued Items"
                value={
                  data.transactions.filter((t) => t.type === "keluar").length
                }
                styles={{ content: { color: "#cf1322" } }}
              />
            </Col>
          </Row>

          <Table
            dataSource={data.transactions}
            columns={columns}
            rowKey={(r) => `${r.type}-${r.id}-${r.product_name}`}
            pagination={{ pageSize: 20 }}
            loading={loading}
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}
    </Space>
  );
};

export default TransactionHistory;
