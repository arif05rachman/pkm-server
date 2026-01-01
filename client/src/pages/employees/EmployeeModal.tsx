import React from "react";
import { Modal, Form, Input, Switch } from "antd";
import type { FormInstance } from "antd";
import type { Employee } from "../../types";

interface EmployeeModalProps {
  open: boolean;
  editingItem: Employee | null;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: FormInstance;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  open,
  editingItem,
  onCancel,
  onSubmit,
  form,
}) => {
  return (
    <Modal
      title={editingItem ? "Edit Employee" : "Add New Employee"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={editingItem || { is_active: true }}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please input employee name!" }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="position"
          label="Position"
          rules={[{ required: true, message: "Please input position!" }]}
        >
          <Input placeholder="e.g. Pharmacist, Staff" />
        </Form.Item>

        <Form.Item name="nip" label="NIP">
          <Input placeholder="Employee Identification Number" />
        </Form.Item>

        <Form.Item name="phone" label="Phone Number">
          <Input placeholder="e.g. 08123456789" />
        </Form.Item>

        <Form.Item name="address" label="Address">
          <Input.TextArea placeholder="Full address" rows={3} />
        </Form.Item>

        <Form.Item
          name="is_active"
          label="Active Status"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeModal;
