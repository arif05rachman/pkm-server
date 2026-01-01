import React from "react";
import { Modal, Form, Input, Select, InputNumber } from "antd";
import type { FormInstance } from "antd";
import type { Product, Category } from "../../types";

interface ProductModalProps {
  open: boolean;
  editingItem: Product | null;
  categories: Category[];
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: FormInstance;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  editingItem,
  categories,
  onCancel,
  onSubmit,
  form,
}) => {
  return (
    <Modal
      title={editingItem ? "Edit Product" : "Add New Product"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={editingItem || { min_stock: 0 }}
      >
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true, message: "Please input product name!" }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="Category"
          rules={[{ required: true, message: "Please select a category!" }]}
        >
          <Select placeholder="Select product category" allowClear>
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="unit"
          label="Unit"
          rules={[{ required: true, message: "Please select unit!" }]}
        >
          <Select placeholder="Select unit">
            <Select.Option value="pcs">pcs</Select.Option>
            <Select.Option value="bottle">bottle</Select.Option>
            <Select.Option value="tablet">tablet</Select.Option>
          </Select>
        </Form.Item>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="min_stock"
            label="Minimum Stock"
            rules={[{ required: true, message: "Please input minimum stock!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input placeholder="e.g. Shelf A-1" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductModal;
