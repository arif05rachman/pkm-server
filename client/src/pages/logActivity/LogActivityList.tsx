import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  App,
  Typography,
  Tag,
  Row,
  Col,
  Card,
  DatePicker,
  Select,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { logActivityApi } from "../../api/logActivity";
import type { LogActivity } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { formatDate } from "../../utils/formatters";
import type { Dayjs } from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { useApp } = App;

const LogActivityList: React.FC = () => {
  const [logs, setLogs] = useState<LogActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = useApp();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<{
    aksi?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await logActivityApi.getAll(
        pagination.current,
        pagination.pageSize,
        filters
      );
      setLogs(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch {
      message.error("Gagal memuat data log activity");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchValue) {
      fetchData();
      return;
    }
    setLoading(true);
    try {
      const data = await logActivityApi.search(
        searchValue,
        pagination.current,
        pagination.pageSize
      );
      setLogs(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch {
      message.error("Gagal mencari log activity");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
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

  const handleActionFilterChange = (value: string) => {
    if (value) {
      setFilters({ ...filters, aksi: value });
    } else {
      const newFilters = { ...filters };
      delete newFilters.aksi;
      setFilters(newFilters);
    }
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const getActionColor = (aksi: string) => {
    if (
      aksi.toLowerCase().includes("create") ||
      aksi.toLowerCase().includes("tambah")
    ) {
      return "green";
    }
    if (
      aksi.toLowerCase().includes("update") ||
      aksi.toLowerCase().includes("edit")
    ) {
      return "blue";
    }
    if (
      aksi.toLowerCase().includes("delete") ||
      aksi.toLowerCase().includes("hapus")
    ) {
      return "red";
    }
    if (aksi.toLowerCase().includes("login")) {
      return "cyan";
    }
    return "default";
  };

  const columns: ColumnsType<LogActivity> = [
    {
      title: "Waktu",
      dataIndex: "waktu",
      key: "waktu",
      render: (waktu: string) => formatDate(waktu),
      sorter: (a, b) =>
        new Date(a.waktu).getTime() - new Date(b.waktu).getTime(),
    },
    {
      title: "User ID",
      dataIndex: "id_user",
      key: "id_user",
      render: (id: number | null) => id || "-",
    },
    {
      title: "Aksi",
      dataIndex: "aksi",
      key: "aksi",
      render: (aksi: string) => <Tag color={getActionColor(aksi)}>{aksi}</Tag>,
    },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
      key: "deskripsi",
      render: (text: string | null) => text || "-",
      ellipsis: true,
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      render: (ip: string | null) => ip || "-",
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Log Activity</Title>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Refresh
          </Button>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Cari log activity..."
                allowClear
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (!e.target.value) {
                    fetchData();
                  }
                }}
                onPressEnter={handleSearch}
              />
              <Button icon={<SearchOutlined />} onClick={handleSearch} />
            </Space.Compact>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter Aksi"
              allowClear
              onChange={handleActionFilterChange}
            >
              <Select.Option value="CREATE">CREATE</Select.Option>
              <Select.Option value="UPDATE">UPDATE</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="LOGIN">LOGIN</Select.Option>
              <Select.Option value="LOGOUT">LOGOUT</Select.Option>
            </Select>
          </Col>
          <Col span={10}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id_log"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} log`,
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
    </div>
  );
};

export default LogActivityList;
