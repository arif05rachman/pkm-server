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
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { barangApi } from "../../api/barang";
import type { Barang } from "../../types";
import dayjs from "dayjs";

interface TransaksiKeluarModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  form: any;
  loading?: boolean;
}

const { Text } = Typography;

const TransaksiKeluarModal: React.FC<TransaksiKeluarModalProps> = ({
  open,
  onCancel,
  onSubmit,
  form,
  loading,
}) => {
  const [barangList, setBarangList] = useState<Barang[]>([]);

  useEffect(() => {
    if (open) {
      fetchBarangList();
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

  return (
    <Modal
      title="Tambah Transaksi Keluar"
      open={open}
      onOk={form.submit}
      onCancel={onCancel}
      width={900}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="tanggal_keluar"
          label="Tanggal Keluar"
          rules={[{ required: true, message: "Pilih tanggal keluar" }]}
          initialValue={dayjs()}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="tujuan"
          label="Tujuan"
          rules={[
            {
              required: true,
              message: "Isi tujuan (e.g., Bagian Umum, Pasien X)",
            },
          ]}
        >
          <Input placeholder="Tujuan pengeluaran barang" />
        </Form.Item>

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
                          style={{ width: 300 }}
                          showSearch
                          optionFilterProp="children"
                        >
                          {barangList.map((item) => (
                            <Select.Option
                              key={item.id_barang}
                              value={item.id_barang}
                              disabled={item.stok <= 0}
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
                    width: 150,
                    render: (_, field) => {
                      // Get selected barang to validate max stock
                      const currentFormDetails = form.getFieldValue([
                        "details",
                        field.name,
                      ]);
                      const selectedBarangId = currentFormDetails?.id_barang;
                      const selectedBarang = barangList.find(
                        (b) => b.id_barang === selectedBarangId
                      );
                      const maxStock = selectedBarang
                        ? selectedBarang.stok
                        : 100000;

                      return (
                        <Form.Item
                          {...field}
                          name={[field.name, "jumlah"]}
                          style={{ marginBottom: 0 }}
                          rules={[
                            { required: true, message: "Wajib" },
                            {
                              type: "number",
                              max: maxStock,
                              message: `Maks ${maxStock}`,
                            },
                          ]}
                        >
                          <InputNumber
                            min={1}
                            max={maxStock}
                            placeholder="Jml"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      );
                    },
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

export default TransaksiKeluarModal;
