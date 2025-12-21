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
import { useKaryawan } from "./useKaryawan";
import KaryawanModal from "./KaryawanModal";
import type { Karyawan } from "@/types";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const KaryawanList: React.FC = () => {
  const {
    karyawan,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchData,
    handleSearch,
    handleDelete,
    setPagination,
    // Modal & Form
    modalVisible,
    editingItem,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  } = useKaryawan();

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
      fixed: "right",
      width: 150,
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
      <Title level={2}>Manajemen Karyawan</Title>
      <Row justify="end" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="end">
            <Space.Compact style={{ width: 250 }}>
              <Input
                placeholder="Cari karyawan..."
                allowClear
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
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

      <Table
        columns={columns}
        dataSource={karyawan}
        rowKey="id_karyawan"
        loading={loading}
        scroll={{ x: "max-content" }}
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

      <KaryawanModal
        open={modalVisible}
        editingItem={editingItem}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};

export default KaryawanList;
