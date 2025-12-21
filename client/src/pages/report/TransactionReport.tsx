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
} from "antd";

import { reportApi } from "../../api/report";
import { formatDate } from "../../utils/formatters";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface TransactionDetail {
  type: "masuk" | "keluar";
  date: string;
  keterangan: string | null;
  jumlah: number;
  harga_satuan: number;
  nama_barang: string;
  satuan: string;
  source_destination: string | null; // supplier or tujuan
  operator: string;
  id: number;
}

const TransactionReport: React.FC = () => {
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

      const result = await reportApi.getAllTransactions(params);
      setData(result.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<TransactionDetail> = [
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: "Tipe",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => (
        <Text type={type === "masuk" ? "success" : "danger"} strong>
          {type.toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Barang",
      key: "barang",
      render: (_, record) => (
        <span>
          <Text strong>{record.nama_barang}</Text>
        </span>
      ),
    },
    {
      title: "Jumlah",
      dataIndex: "jumlah",
      key: "jumlah",
      align: "right",
      render: (val, record) => `${val} ${record.satuan}`,
    },
    {
      title: "Harga",
      dataIndex: "harga_satuan",
      key: "harga",
      align: "right",
      render: (val, record) =>
        record.type === "masuk"
          ? new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(val)
          : "-",
    },
    {
      title: "Total",
      key: "total",
      align: "right",
      render: (_, record) =>
        record.type === "masuk"
          ? new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(record.jumlah * record.harga_satuan)
          : "-",
    },
    {
      title: "Asal/Tujuan",
      dataIndex: "source_destination",
      key: "source_destination",
      render: (val) => val || "-",
    },
    {
      title: "Operator",
      dataIndex: "operator",
      key: "operator",
    },
  ];

  const totalMasuk =
    data?.transactions
      .filter((t) => t.type === "masuk")
      .reduce((acc, curr) => acc + curr.jumlah * curr.harga_satuan, 0) || 0;

  return (
    <div>
      <Title level={2}>Laporan Transaksi</Title>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row align="middle" gutter={16}>
            <Col>
              <Radio.Group
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <Radio.Button value="monthly">Bulanan</Radio.Button>
                <Radio.Button value="yearly">Tahunan</Radio.Button>
                <Radio.Button value="custom">Custom</Radio.Button>
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
            <Col>
              {/* <Button type="primary" icon={<FilterOutlined />} onClick={fetchReport}>Filter</Button> */}
            </Col>
          </Row>
        </Space>
      </Card>

      {data && (
        <Card>
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="Total Transaksi Masuk (Nilai)"
                value={totalMasuk}
                prefix="Rp"
                precision={0}
                formatter={(value) =>
                  new Intl.NumberFormat("id-ID").format(Number(value))
                }
                valueStyle={{ color: "#3f8600" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Jumlah Item Masuk"
                value={
                  data.transactions.filter((t) => t.type === "masuk").length
                }
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Jumlah Item Keluar"
                value={
                  data.transactions.filter((t) => t.type === "keluar").length
                }
                valueStyle={{ color: "#cf1322" }}
              />
            </Col>
          </Row>

          <Table
            dataSource={data.transactions}
            columns={columns}
            rowKey={(r) => `${r.type}-${r.id}-${r.nama_barang}`}
            pagination={{ pageSize: 20 }}
            size="small"
            loading={loading}
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}
    </div>
  );
};

export default TransactionReport;
