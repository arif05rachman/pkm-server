import React from "react";
import { Modal, Form, Input } from "antd";
import type { FormInstance } from "antd";
import type { Category } from "../../types";

interface CategoryModalProps {
  open: boolean;
  editingItem: Category | null;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: FormInstance;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  editingItem,
  onCancel,
  onSubmit,
  form,
}) => {
  return (
    <Modal
      title={editingItem ? "Edit Category" : "Add New Category"}
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
          label="Category Name"
          rules={[{ required: true, message: "Please input category name!" }]}
        >
          <Input placeholder="e.g. Antibiotics, Analgesics" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={4}
            placeholder="Brief description of the category"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
