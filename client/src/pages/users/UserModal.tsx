import React from "react";
import { Modal, Form, Input, Select, Switch } from "antd";
import type { FormInstance } from "antd";
import type { User, Employee } from "../../types";

interface UserModalProps {
  open: boolean;
  editingItem: User | null;
  employees: Employee[];
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: FormInstance;
}

const UserModal: React.FC<UserModalProps> = ({
  open,
  editingItem,
  employees,
  onCancel,
  onSubmit,
  form,
}) => {
  return (
    <Modal
      title="Edit User"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={editingItem || {}}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select role!" }]}
        >
          <Select placeholder="Select user role">
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="manager">Manager</Select.Option>
            <Select.Option value="user">User</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="employee_id" label="Link to Employee">
          <Select placeholder="Select employee" allowClear>
            {employees.map((emp) => (
              <Select.Option key={emp.id} value={emp.id}>
                {emp.name} ({emp.position})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="is_active"
          label="Status Active"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
