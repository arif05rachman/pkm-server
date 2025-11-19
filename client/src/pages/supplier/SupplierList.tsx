import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { supplierApi } from "../../api/supplier";
import type { Supplier } from "../../types";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { TextArea } = Input;
const { useApp } = App;

const SupplierList: React.FC = () => {
  const [supplier, setSupplier] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);
  const [form] = Form.useForm();
  const { message } = useApp();
  const [searchValue, setSearchValue] = useState("");
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
      const data = await supplierApi.getAll(
        pagination.current,
        pagination.pageSize
      );
      setSupplier(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error("Gagal memuat data supplier");
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
      const data = await supplierApi.search(value, 1, pagination.pageSize);
      setSupplier(data.data);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error("Gagal mencari supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await supplierApi.delete(id);
      message.success("Supplier berhasil dihapus");
      fetchData();
    } catch (error) {
      message.error("Gagal menghapus supplier");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await supplierApi.update(editingItem.id_supplier, values);
        message.success("Supplier berhasil diupdate");
      } else {
        await supplierApi.create(values);
        message.success("Supplier berhasil ditambahkan");
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Gagal menyimpan data");
    }
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: "Nama Supplier",
      dataIndex: "nama_supplier",
      key: "nama_supplier",
      render: (text) => (
        <Space>
          <ShopOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Alamat",
      dataIndex: "alamat",
      key: "alamat",
      render: (alamat) =>
        alamat ? (
          <Space>
            <EnvironmentOutlined />
            {alamat}
          </Space>
        ) : (
          "-"
        ),
    },
    {
      title: "Kontak",
      dataIndex: "kontak",
      key: "kontak",
      render: (kontak) =>
        kontak ? (
          <Space>
            <PhoneOutlined />
            {kontak}
          </Space>
        ) : (
          "-"
        ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: Supplier) => (
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
            title="Hapus supplier ini?"
            onConfirm={() => handleDelete(record.id_supplier)}
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
          <Title level={2}>Manajemen Supplier</Title>
        </Col>
        <Col>
          <Space>
            <Space.Compact style={{ width: 250 }}>
              <Input
                placeholder="Cari supplier..."
                allowClear
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (!e.target.value) {
                    fetchData();
                  }
                }}
                onPressEnter={() => handleSearch(searchValue)}
              />
              <Button
                icon={<SearchOutlined />}
                onClick={() => handleSearch(searchValue)}
              />
            </Space.Compact>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tambah Supplier
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={supplier}
          rowKey="id_supplier"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} supplier`,
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
        title={editingItem ? "Edit Supplier" : "Tambah Supplier"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nama_supplier"
            label="Nama Supplier"
            rules={[{ required: true, message: "Nama supplier wajib diisi" }]}
          >
            <Input placeholder="Nama Supplier" />
          </Form.Item>

          <Form.Item name="alamat" label="Alamat">
            <TextArea rows={3} placeholder="Alamat" />
          </Form.Item>

          <Form.Item name="kontak" label="Kontak">
            <Input placeholder="No. Telepon/HP" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierList;
