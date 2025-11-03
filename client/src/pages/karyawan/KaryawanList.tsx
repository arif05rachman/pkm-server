import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
  Card,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { karyawanApi } from '../../api/karyawan';
import type { Karyawan } from '../../types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const KaryawanList: React.FC = () => {
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Karyawan | null>(null);
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
      const data = await karyawanApi.getAll(
        pagination.current,
        pagination.pageSize
      );
      setKaryawan(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error('Gagal memuat data karyawan');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    if (!value) {
      fetchData();
      return;
    }
    setLoading(true);
    try {
      const data = await karyawanApi.search(value, 1, pagination.pageSize);
      setKaryawan(data.data);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error('Gagal mencari karyawan');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Karyawan) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await karyawanApi.delete(id);
      message.success('Karyawan berhasil dihapus');
      fetchData();
    } catch (error) {
      message.error('Gagal menghapus karyawan');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await karyawanApi.update(editingItem.id_karyawan, values);
        message.success('Karyawan berhasil diupdate');
      } else {
        await karyawanApi.create(values);
        message.success('Karyawan berhasil ditambahkan');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const columns: ColumnsType<Karyawan> = [
    {
      title: 'Nama',
      dataIndex: 'nama_karyawan',
      key: 'nama_karyawan',
    },
    {
      title: 'Jabatan',
      dataIndex: 'jabatan',
      key: 'jabatan',
    },
    {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
    },
    {
      title: 'No. HP',
      dataIndex: 'no_hp',
      key: 'no_hp',
    },
    {
      title: 'Status',
      dataIndex: 'status_aktif',
      key: 'status_aktif',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Aktif' : 'Tidak Aktif'}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: Karyawan) => (
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
            title="Hapus karyawan ini?"
            onConfirm={() => handleDelete(record.id_karyawan)}
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
          <Title level={2}>Manajemen Karyawan</Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Cari karyawan..."
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
              Tambah Karyawan
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={karyawan}
          rowKey="id_karyawan"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} karyawan`,
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
        title={editingItem ? 'Edit Karyawan' : 'Tambah Karyawan'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nama_karyawan"
                label="Nama Karyawan"
                rules={[
                  { required: true, message: 'Nama karyawan wajib diisi' },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nama Karyawan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="jabatan"
                label="Jabatan"
                rules={[{ required: true, message: 'Jabatan wajib diisi' }]}
              >
                <Input placeholder="Jabatan" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nip" label="NIP">
                <Input placeholder="NIP" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="no_hp" label="No. HP">
                <Input placeholder="No. HP" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="alamat" label="Alamat">
            <TextArea rows={3} placeholder="Alamat" />
          </Form.Item>

          <Form.Item
            name="status_aktif"
            label="Status"
            initialValue={true}
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Tidak Aktif" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KaryawanList;

