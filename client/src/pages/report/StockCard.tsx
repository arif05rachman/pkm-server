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
} from "antd";
import { reportApi } from "../../api/report";
import { barangApi } from "../../api/barang";
import { formatDate } from "../../utils/formatters";
import type { Barang } from "../../types";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface StockMovement {
  type: "masuk" | "keluar";
  date: string;
  keterangan: string | null;
  jumlah: number;
  operator: string | null;
}

const StockCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [selectedBarang, setSelectedBarang] = useState<number | null>(null);
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [reportData, setReportData] = useState<{
    barang: Barang;
    period: { start: string; end: string };
    movements: StockMovement[];
  } | null>(null);
  const { message } = App.useApp();

  useEffect(() => {
    fetchBarangList();
  }, []);

  useEffect(() => {
    if (selectedBarang && dates) {
      fetchReport();
    }
  }, [selectedBarang, dates]);

  const fetchBarangList = async () => {
    try {
      // Fetch larger list for dropdown
      const data = await barangApi.getAll(1, 1000);
      setBarangList(data.data);
    } catch (error) {
      console.error("Failed to fetch barang");
    }
  };

  const fetchReport = async () => {
    if (!selectedBarang || !dates) return;

    setLoading(true);
    try {
      const data = await reportApi.getStockCard(
        selectedBarang,
        dates[0].format("YYYY-MM-DD"),
        dates[1].format("YYYY-MM-DD")
      );
      setReportData(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Gagal memuat kartu stok");
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = (movements: StockMovement[]) => {
    // Note: This balance calculation assumes 0 start balance if not provided API
    // Ideally API provides starting balance. For now, we show running balance relative to period start?
    // Or we just show In/Out.
    // Let's implement a running balance column, assuming start is 0 or unknown.
    // If unknown, maybe just show flow.
    let balance = 0;
    return movements.map((m) => {
      if (m.type === "masuk") balance += m.jumlah;
      else balance -= m.jumlah;
      return { ...m, balance };
    });
  };

  const dataSource = reportData ? calculateBalance(reportData.movements) : [];

  const columns: ColumnsType<StockMovement & { balance: number }> = [
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Jenis",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Text type={type === "masuk" ? "success" : "danger"} strong>
          {type.toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Masuk",
      dataIndex: "jumlah",
      key: "masuk",
      align: "right",
      render: (val, record) => (record.type === "masuk" ? val : "-"),
    },
    {
      title: "Keluar",
      dataIndex: "jumlah",
      key: "keluar",
      align: "right",
      render: (val, record) => (record.type === "keluar" ? val : "-"),
    },
    // {
    //   title: "Saldo",
    //   dataIndex: "balance",
    //   key: "balance",
    //   align: "right",
    //   // NOTE: This balance is not accurate without starting balance.
    //   // Maybe checking with the user or hiding it for now is better.
    //   // See Implementation Plan.
    // },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
    },
    {
      title: "Operator",
      dataIndex: "operator",
      key: "operator",
    },
  ];

  return (
    <div>
      <Title level={2}>Kartu Stok</Title>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Text strong>Pilih Barang:</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              showSearch
              placeholder="Cari Barang..."
              optionFilterProp="children"
              onChange={setSelectedBarang}
              value={selectedBarang}
            >
              {barangList.map((b) => (
                <Select.Option key={b.id_barang} value={b.id_barang}>
                  {b.nama_barang}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Periode:</Text>
            <br />
            <RangePicker
              style={{ width: "100%", marginTop: 8 }}
              value={dates}
              onChange={(val) => setDates(val as any)}
              format="YYYY-MM-DD"
              allowClear={false}
            />
          </Col>
          {/* <Col span={8}>
             <Button type="primary" icon={<ReloadOutlined />} onClick={fetchReport} style={{ marginTop: 30 }}>Generate</Button>
          </Col> */}
        </Row>
      </Card>

      {reportData ? (
        <Card title={`Kartu Stok: ${reportData.barang.nama_barang}`}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="Total Masuk"
                value={dataSource
                  .filter((m) => m.type === "masuk")
                  .reduce((acc, curr) => acc + curr.jumlah, 0)}
                valueStyle={{ color: "#3f8600" }}
                suffix={reportData.barang.satuan}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Keluar"
                value={dataSource
                  .filter((m) => m.type === "keluar")
                  .reduce((acc, curr) => acc + curr.jumlah, 0)}
                valueStyle={{ color: "#cf1322" }}
                suffix={reportData.barang.satuan}
              />
            </Col>
          </Row>

          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey={(r) => r.date + r.type + r.jumlah} // simple key
            pagination={false}
            size="small"
            loading={loading}
            scroll={{ x: "max-content" }}
          />
        </Card>
      ) : (
        <Empty description="Pilih barang untuk melihat kartu stok" />
      )}
    </div>
  );
};

export default StockCard;
