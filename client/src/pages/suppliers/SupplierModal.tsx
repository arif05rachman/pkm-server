import React from "react";
import { Modal, Form, Input } from "antd";
import type { FormInstance } from "antd";
import type { Supplier } from "../../types";

interface SupplierModalProps {
  open: boolean;
  editingItem: Supplier | null;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: FormInstance;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  editingItem,
  onCancel,
  onSubmit,
  form,
}) => {
  return (
    <Modal
      title={editingItem ? "Edit Supplier" : "Add New Supplier"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={editingItem || {}}
      >
        <Form.Item
          name="name"
          label="Supplier Name"
          rules={[{ required: true, message: "Please input supplier name!" }]}
        >
          <Input placeholder="Enter supplier name" />
        </Form.Item>

        <Form.Item name="address" label="Address">
          <Input.TextArea placeholder="Full address" rows={3} />
        </Form.Item>

        <Form.Item name="contact" label="Contact Information">
          <Input placeholder="Phone number or email" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SupplierModal;
