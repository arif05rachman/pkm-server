import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Form,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useKaryawan } from "./useKaryawan";
import KaryawanModal from "./KaryawanModal";
import type { Karyawan } from "@/types";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const KaryawanList: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Karyawan | null>(null);
  const [form] = Form.useForm();

  const {
    karyawan,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchData,
    handleSearch,
    handleDelete,
    handleSubmit,
    setPagination,
  } = useKaryawan();

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

  const handleModalSubmit = async (
    values: Parameters<typeof handleSubmit>[0]
  ) => {
    return await handleSubmit(values, editingItem);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const columns: ColumnsType<Karyawan> = [
    {
      title: "Nama",
      dataIndex: "nama_karyawan",
      key: "nama_karyawan",
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan",
      key: "jabatan",
    },
    {
      title: "NIP",
      dataIndex: "nip",
      key: "nip",
    },
    {
      title: "No. HP",
      dataIndex: "no_hp",
      key: "no_hp",
    },
    {
      title: "Status",
      dataIndex: "status_aktif",
      key: "status_aktif",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Aktif" : "Tidak Aktif"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: unknown, record: Karyawan) => (
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
          <Title level={2}>Manajemen Karyawan</Title>
        </Col>
        <Col>
          <Space>
            <Space.Compact style={{ width: 250 }}>
              <Input
                placeholder="Cari karyawan..."
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
          scroll={{ x: "max-content" }}
        />
      </Card>

      <KaryawanModal
        open={modalVisible}
        editingItem={editingItem}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        form={form}
      />
    </div>
  );
};

export default KaryawanList;
