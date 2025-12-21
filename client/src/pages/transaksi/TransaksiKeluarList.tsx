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
  Card,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { transaksiKeluarApi } from "../../api/transaksi";
import type { TransaksiKeluar } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { formatDate } from "../../utils/formatters";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const { useApp } = App;

import TransaksiKeluarModal from "./TransaksiKeluarModal";

const TransaksiKeluarList: React.FC = () => {
  const [transaksi, setTransaksi] = useState<TransaksiKeluar[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] =
    useState<TransaksiKeluar | null>(null);
  const [editingItem, setEditingItem] = useState<TransaksiKeluar | null>(null);
  const [form] = Form.useForm();
  const { message } = useApp();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    tujuan?: string;
  }>({});

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await transaksiKeluarApi.getAll(
        pagination.current,
        pagination.pageSize,
        filters
      );
      setTransaksi(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error("Gagal memuat data transaksi keluar");
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

  const handleViewDetails = async (record: TransaksiKeluar) => {
    try {
      const fullData = await transaksiKeluarApi.getById(
        record.id_transaksi_keluar
      );
      setSelectedTransaksi(fullData);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Gagal memuat detail transaksi");
    }
  };

  const handleEdit = (record: TransaksiKeluar) => {
    setEditingItem(record);
    form.setFieldsValue({
      tanggal_keluar: dayjs(record.tanggal_keluar),
      tujuan: record.tujuan,
      keterangan: record.keterangan,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await transaksiKeluarApi.delete(id);
      message.success("Transaksi keluar berhasil dihapus");
      fetchData();
    } catch (error) {
      message.error("Gagal menghapus transaksi keluar");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await transaksiKeluarApi.update(editingItem.id_transaksi_keluar, {
          tanggal_keluar: values.tanggal_keluar.format("YYYY-MM-DD"),
          tujuan: values.tujuan,
          keterangan: values.keterangan,
        });
        message.success("Transaksi keluar berhasil diupdate");
      } else {
        const formattedValues = {
          ...values,
          tanggal_keluar: values.tanggal_keluar.format("YYYY-MM-DD"),
        };
        await transaksiKeluarApi.create(formattedValues);
        message.success("Transaksi keluar berhasil dibuat");
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Gagal menyimpan data");
    }
  };

  const columns: ColumnsType<TransaksiKeluar> = [
    {
      title: "Tanggal Keluar",
      dataIndex: "tanggal_keluar",
      key: "tanggal_keluar",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Tujuan",
      dataIndex: "tujuan",
      key: "tujuan",
    },
    {
      title: "User",
      dataIndex: "username",
      key: "username",
      render: (text: string | undefined) => text || "-",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
      render: (text: string | null) => text || "-",
      ellipsis: true,
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: TransaksiKeluar) => (
        <Space size="middle">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Detail
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
            title="Hapus transaksi ini?"
            onConfirm={() => handleDelete(record.id_transaksi_keluar)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Transaksi Keluar</Title>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <RangePicker onChange={handleDateRangeChange} format="YYYY-MM-DD" />
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>
          </Space>
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
            Tambah Transaksi
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={transaksi}
          rowKey="id_transaksi_keluar"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} transaksi`,
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

      <TransaksiKeluarModal
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
        title="Detail Transaksi Keluar"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTransaksi && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Tanggal Keluar:</strong>{" "}
                {formatDate(selectedTransaksi.tanggal_keluar)}
              </Col>
              <Col span={12}>
                <strong>Tujuan:</strong> {selectedTransaksi.tujuan}
              </Col>
              <Col span={12} style={{ marginTop: 8 }}>
                <strong>User:</strong> {selectedTransaksi.username || "-"}
              </Col>
              {selectedTransaksi.keterangan && (
                <Col span={24} style={{ marginTop: 8 }}>
                  <strong>Keterangan:</strong> {selectedTransaksi.keterangan}
                </Col>
              )}
            </Row>
            {selectedTransaksi.details &&
              selectedTransaksi.details.length > 0 && (
                <Table
                  columns={[
                    {
                      title: "Barang",
                      dataIndex: "nama_barang",
                      key: "nama_barang",
                    },
                    {
                      title: "Jumlah",
                      dataIndex: "jumlah",
                      key: "jumlah",
                      align: "right",
                    },
                  ]}
                  dataSource={selectedTransaksi.details}
                  rowKey="id_detail_keluar"
                  pagination={false}
                  size="small"
                  scroll={{ x: "max-content" }}
                />
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransaksiKeluarList;
