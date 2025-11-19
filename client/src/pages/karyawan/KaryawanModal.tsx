import React from "react";
import { Modal, Form, Input, Switch, Row, Col, type FormInstance } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { Karyawan } from "@/types";

const { TextArea } = Input;

interface KaryawanFormValues {
  nama_karyawan: string;
  jabatan: string;
  nip?: string;
  no_hp?: string;
  alamat?: string;
  status_aktif?: boolean;
}

interface KaryawanModalProps {
  open: boolean;
  editingItem: Karyawan | null;
  onCancel: () => void;
  onSubmit: (values: KaryawanFormValues) => Promise<boolean>;
  form: FormInstance<KaryawanFormValues>;
}

const KaryawanModal: React.FC<KaryawanModalProps> = ({
  open,
  editingItem,
  onCancel,
  onSubmit,
  form,
}) => {
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const success = await onSubmit(values);
      if (success) {
        form.resetFields();
        onCancel();
      }
    } catch {
      // Validation errors are handled by form
    }
  };

  return (
    <Modal
      title={editingItem ? "Edit Karyawan" : "Tambah Karyawan"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nama_karyawan"
              label="Nama Karyawan"
              rules={[{ required: true, message: "Nama karyawan wajib diisi" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nama Karyawan" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="jabatan"
              label="Jabatan"
              rules={[{ required: true, message: "Jabatan wajib diisi" }]}
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

        <Form.Item name="status_aktif" label="Status" initialValue={true}>
          <Switch checkedChildren="Aktif" unCheckedChildren="Tidak Aktif" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default KaryawanModal;
