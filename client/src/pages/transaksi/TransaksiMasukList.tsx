import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  App,
  Popconfirm,
  Typography,
  Row,
  Col,
  Card,
  DatePicker,
  Select,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { transaksiMasukApi } from '../../api/transaksi';
import { barangApi } from '../../api/barang';
import { supplierApi } from '../../api/supplier';
import type { TransaksiMasuk, Barang, Supplier } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import { formatDate } from '../../utils/formatters';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { useApp } = App;

const TransaksiMasukList: React.FC = () => {
  const [transaksi, setTransaksi] = useState<TransaksiMasuk[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState<TransaksiMasuk | null>(null);
  const [editingItem, setEditingItem] = useState<TransaksiMasuk | null>(null);
  const [form] = Form.useForm();
  const { message } = useApp();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    id_supplier?: number;
  }>({});
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  useEffect(() => {
    fetchData();
    fetchBarangList();
    fetchSupplierList();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await transaksiMasukApi.getAll(
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
      message.error('Gagal memuat data transaksi masuk');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangList = async () => {
    try {
      const data = await barangApi.getAll(1, 1000);
      setBarangList(data.data);
    } catch (error) {
      console.error('Failed to fetch barang list');
    }
  };

  const fetchSupplierList = async () => {
    try {
      const data = await supplierApi.getAll(1, 1000);
      setSupplierList(data.data);
    } catch (error) {
      console.error('Failed to fetch supplier list');
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
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

  const handleViewDetails = async (record: TransaksiMasuk) => {
    try {
      const fullData = await transaksiMasukApi.getById(record.id_transaksi_masuk);
      setSelectedTransaksi(fullData);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Gagal memuat detail transaksi');
    }
  };

  const handleEdit = (record: TransaksiMasuk) => {
    setEditingItem(record);
    form.setFieldsValue({
      tanggal_masuk: dayjs(record.tanggal_masuk),
      id_supplier: record.id_supplier,
      keterangan: record.keterangan,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await transaksiMasukApi.delete(id);
      message.success('Transaksi masuk berhasil dihapus');
      fetchData();
    } catch (error) {
      message.error('Gagal menghapus transaksi masuk');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await transaksiMasukApi.update(editingItem.id_transaksi_masuk, {
          tanggal_masuk: values.tanggal_masuk.format('YYYY-MM-DD'),
          id_supplier: values.id_supplier,
          keterangan: values.keterangan,
        });
        message.success('Transaksi masuk berhasil diupdate');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const columns: ColumnsType<TransaksiMasuk> = [
    {
      title: 'Tanggal Masuk',
      dataIndex: 'tanggal_masuk',
      key: 'tanggal_masuk',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Supplier',
      dataIndex: 'nama_supplier',
      key: 'nama_supplier',
      render: (text: string | undefined) => text || '-',
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text: string | undefined) => text || '-',
    },
    {
      title: 'Keterangan',
      dataIndex: 'keterangan',
      key: 'keterangan',
      render: (text: string | null) => text || '-',
      ellipsis: true,
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: TransaksiMasuk) => (
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
            onConfirm={() => handleDelete(record.id_transaksi_masuk)}
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Transaksi Masuk</Title>
        </Col>
        <Col>
          <Space>
            <RangePicker
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={transaksi}
          rowKey="id_transaksi_masuk"
          loading={loading}
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

      <Modal
        title="Edit Transaksi Masuk"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tanggal_masuk"
            label="Tanggal Masuk"
            rules={[{ required: true, message: 'Tanggal masuk wajib diisi' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="id_supplier" label="Supplier">
            <Select placeholder="Pilih Supplier" allowClear>
              {supplierList.map((supplier) => (
                <Select.Option
                  key={supplier.id_supplier}
                  value={supplier.id_supplier}
                >
                  {supplier.nama_supplier}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="keterangan" label="Keterangan">
            <TextArea rows={3} placeholder="Keterangan" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Detail Transaksi Masuk"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTransaksi && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Tanggal Masuk:</strong> {formatDate(selectedTransaksi.tanggal_masuk)}
              </Col>
              <Col span={12}>
                <strong>Supplier:</strong> {selectedTransaksi.nama_supplier || '-'}
              </Col>
              <Col span={12} style={{ marginTop: 8 }}>
                <strong>User:</strong> {selectedTransaksi.username || '-'}
              </Col>
              {selectedTransaksi.keterangan && (
                <Col span={24} style={{ marginTop: 8 }}>
                  <strong>Keterangan:</strong> {selectedTransaksi.keterangan}
                </Col>
              )}
            </Row>
            {selectedTransaksi.details && selectedTransaksi.details.length > 0 && (
              <Table
                columns={[
                  { title: 'Barang', dataIndex: 'nama_barang', key: 'nama_barang' },
                  { title: 'Jumlah', dataIndex: 'jumlah', key: 'jumlah', align: 'right' },
                  {
                    title: 'Harga Satuan',
                    dataIndex: 'harga_satuan',
                    key: 'harga_satuan',
                    align: 'right',
                    render: (harga: number) =>
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(harga),
                  },
                  {
                    title: 'Total',
                    key: 'total',
                    align: 'right',
                    render: (_: any, record: any) =>
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(record.jumlah * record.harga_satuan),
                  },
                  {
                    title: 'Tanggal Kadaluarsa',
                    dataIndex: 'tanggal_kadaluarsa',
                    key: 'tanggal_kadaluarsa',
                    render: (date: string | null) => (date ? formatDate(date) : '-'),
                  },
                ]}
                dataSource={selectedTransaksi.details}
                rowKey="id_detail_masuk"
                pagination={false}
                size="small"
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransaksiMasukList;

