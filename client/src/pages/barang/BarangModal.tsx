import React from "react";
import { Modal, Form, Input, Select, Row, Col, type FormInstance } from "antd";
import type { Barang } from "../../types";

interface BarangModalProps {
  open: boolean;
  editingItem: Barang | null;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  form: FormInstance;
}

const BarangModal: React.FC<BarangModalProps> = ({
  open,
  editingItem,
  onCancel,
  onSubmit,
  form,
}) => {
  // useEffect removed as form values are controlled by hook

  return (
    <Modal
      title={editingItem ? "Edit Barang" : "Tambah Barang"}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="nama_barang"
          label="Nama Barang"
          rules={[{ required: true, message: "Nama barang wajib diisi" }]}
        >
          <Input placeholder="Nama Barang" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="jenis"
              label="Jenis"
              rules={[{ required: true, message: "Jenis wajib diisi" }]}
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
              rules={[{ required: true, message: "Satuan wajib diisi" }]}
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
                {
                  type: "number",
                  min: 0,
                  message: "Stok minimal harus >= 0",
                  transform: (value) => Number(value),
                },
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
  );
};

export default BarangModal;
