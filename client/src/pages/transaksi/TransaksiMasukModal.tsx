import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Table,
  InputNumber,
  Row,
  Col,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { barangApi } from "../../api/barang";
import { supplierApi } from "../../api/supplier";
import type { Barang, Supplier } from "../../types";
import dayjs from "dayjs";

interface TransaksiMasukModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  form: any;
  loading?: boolean;
}

const { Text } = Typography;

const TransaksiMasukModal: React.FC<TransaksiMasukModalProps> = ({
  open,
  onCancel,
  onSubmit,
  form,
  loading,
}) => {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  useEffect(() => {
    if (open) {
      fetchBarangList();
      fetchSupplierList();
    }
  }, [open]);

  const fetchBarangList = async () => {
    try {
      const data = await barangApi.getAll(1, 1000);
      setBarangList(data.data);
    } catch (error) {
      console.error("Failed to fetch barang list");
    }
  };

  const fetchSupplierList = async () => {
    try {
      const data = await supplierApi.getAll(1, 1000);
      setSupplierList(data.data);
    } catch (error) {
      console.error("Failed to fetch supplier list");
    }
  };

  return (
    <Modal
      title="Tambah Transaksi Masuk"
      open={open}
      onOk={form.submit}
      onCancel={onCancel}
      width={900}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tanggal_masuk"
              label="Tanggal Masuk"
              rules={[{ required: true, message: "Pilih tanggal masuk" }]}
              initialValue={dayjs()}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="id_supplier"
              label="Supplier"
              rules={[{ required: true, message: "Pilih supplier" }]}
            >
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
          </Col>
        </Row>

        <Form.Item name="keterangan" label="Keterangan">
          <Input.TextArea rows={2} placeholder="Keterangan tambahan" />
        </Form.Item>

        <Form.List
          name="details"
          rules={[
            {
              validator: async (_, names) => {
                if (!names || names.length < 1) {
                  return Promise.reject(
                    new Error("Minimal satu barang harus dipilih")
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text strong>Daftar Barang</Text>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Tambah Barang
                </Button>
              </div>

              <Table
                dataSource={fields}
                pagination={false}
                rowKey="key"
                size="small"
                columns={[
                  {
                    title: "Barang",
                    key: "id_barang",
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "id_barang"]}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "Pilih barang" }]}
                      >
                        <Select
                          placeholder="Pilih Barang"
                          style={{ width: 250 }}
                          showSearch
                          optionFilterProp="children"
                        >
                          {barangList.map((item) => (
                            <Select.Option
                              key={item.id_barang}
                              value={item.id_barang}
                            >
                              {item.nama_barang} (Stok: {item.stok})
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Jumlah",
                    key: "jumlah",
                    width: 120,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "jumlah"]}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "Wajib" }]}
                      >
                        <InputNumber
                          min={1}
                          placeholder="Jml"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Harga Satuan",
                    key: "harga_satuan",
                    width: 150,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "harga_satuan"]}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "Wajib" }]}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Harga"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Kadaluarsa",
                    key: "tanggal_kadaluarsa",
                    width: 150,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "tanggal_kadaluarsa"]}
                        style={{ marginBottom: 0 }}
                      >
                        <DatePicker
                          placeholder="Exp Date"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "",
                    key: "action",
                    width: 50,
                    render: (_, field) => (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    ),
                  },
                ]}
                scroll={{ x: "max-content" }}
              />
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default TransaksiMasukModal;
