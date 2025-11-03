import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
  Card,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { barangApi } from '../../api/barang';
import type { Barang } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import { getJenisColor } from '../../utils/formatters';

const { Title } = Typography;
const { Search } = Input;

const BarangList: React.FC = () => {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Barang | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await barangApi.getAll(
        pagination.current,
        pagination.pageSize
      );
      setBarang(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error('Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setLoading(true);
    try {
      const data = await barangApi.search(value, 1, pagination.pageSize);
      setBarang(data.data);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error('Gagal mencari barang');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Barang) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await barangApi.delete(id);
      message.success('Barang berhasil dihapus');
      fetchData();
    } catch (error) {
      message.error('Gagal menghapus barang');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await barangApi.update(editingItem.id_barang, values);
        message.success('Barang berhasil diupdate');
      } else {
        await barangApi.create(values);
        message.success('Barang berhasil ditambahkan');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const columns: ColumnsType<Barang> = [
    {
      title: 'Nama Barang',
      dataIndex: 'nama_barang',
      key: 'nama_barang',
    },
    {
      title: 'Jenis',
      dataIndex: 'jenis',
      key: 'jenis',
      render: (jenis: string) => (
        <Tag color={getJenisColor(jenis as any)}>{jenis}</Tag>
      ),
    },
    {
      title: 'Satuan',
      dataIndex: 'satuan',
      key: 'satuan',
    },
    {
      title: 'Stok Minimal',
      dataIndex: 'stok_minimal',
      key: 'stok_minimal',
      align: 'right',
    },
    {
      title: 'Lokasi',
      dataIndex: 'lokasi',
      key: 'lokasi',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: Barang) => (
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
            title="Hapus barang ini?"
            onConfirm={() => handleDelete(record.id_barang)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
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
          <Title level={2}>Manajemen Barang</Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Cari barang..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Tambah Barang
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={barang}
          rowKey="id_barang"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} barang`,
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
        title={editingItem ? 'Edit Barang' : 'Tambah Barang'}
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
            name="nama_barang"
            label="Nama Barang"
            rules={[{ required: true, message: 'Nama barang wajib diisi' }]}
          >
            <Input placeholder="Nama Barang" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="jenis"
                label="Jenis"
                rules={[{ required: true, message: 'Jenis wajib diisi' }]}
              >
                <Select placeholder="Pilih Jenis">
                  <Select.Option value="Obat">Obat</Select.Option>
                  <Select.Option value="Alkes">Alkes</Select.Option>
                  <Select.Option value="BMHP">BMHP</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="satuan"
                label="Satuan"
                rules={[{ required: true, message: 'Satuan wajib diisi' }]}
              >
                <Select placeholder="Pilih Satuan">
                  <Select.Option value="pcs">Pcs</Select.Option>
                  <Select.Option value="botol">Botol</Select.Option>
                  <Select.Option value="tablet">Tablet</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stok_minimal"
                label="Stok Minimal"
                rules={[
                  { type: 'number', min: 0, message: 'Stok minimal harus >= 0' },
                ]}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lokasi" label="Lokasi">
                <Input placeholder="Lokasi" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default BarangList;

