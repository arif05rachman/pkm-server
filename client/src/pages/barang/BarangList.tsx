import React from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { Barang } from "../../types";
import type { ColumnsType } from "antd/es/table";
import { getJenisColor } from "../../utils/formatters";
import { useBarang } from "./useBarang";
import BarangModal from "./BarangModal";

const { Title } = Typography;

const BarangList: React.FC = () => {
  const {
    barang,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchBarang,
    handleSearch,
    deleteBarang,
    changePage,
    // Modal & Form
    modalVisible,
    editingItem,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  } = useBarang();

  const columns: ColumnsType<Barang> = [
    {
      title: "Nama Barang",
      dataIndex: "nama_barang",
      key: "nama_barang",
    },
    {
      title: "Jenis",
      dataIndex: "jenis",
      key: "jenis",
      render: (jenis: string) => (
        <Tag color={getJenisColor(jenis as any)}>{jenis}</Tag>
      ),
    },
    {
      title: "Satuan",
      dataIndex: "satuan",
      key: "satuan",
      align: "right",
    },
    {
      title: "Stok Minimal",
      dataIndex: "stok_minimal",
      key: "stok_minimal",
      align: "right",
    },
    {
      title: "Stok",
      dataIndex: "stok",
      key: "stok",
      align: "right",
      render: (stok: number, record: Barang) => (
        <Typography.Text
          type={stok <= record.stok_minimal ? "danger" : undefined}
          strong
        >
          {stok}
        </Typography.Text>
      ),
    },
    {
      title: "Lokasi",
      dataIndex: "lokasi",
      key: "lokasi",
    },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      width: 150,
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
            onConfirm={() => deleteBarang(record.id_barang)}
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
      <Title level={2}>Manajemen Barang</Title>
      <Row justify="end" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Space.Compact style={{ width: 250 }}>
              <Input
                placeholder="Cari barang..."
                allowClear
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button icon={<SearchOutlined />} onClick={handleSearch} />
            </Space.Compact>
            <Button icon={<ReloadOutlined />} onClick={fetchBarang}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tambah Barang
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={barang}
        rowKey="id_barang"
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} barang`,
          onChange: changePage,
        }}
      />

      <BarangModal
        open={modalVisible}
        editingItem={editingItem}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};

export default BarangList;
