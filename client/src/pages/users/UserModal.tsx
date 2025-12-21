import React from "react";
import { Modal, Form, Input, Select, Switch, type FormInstance } from "antd";
import type { User } from "../../types";

interface UserModalProps {
  open: boolean;
  editingUser: User | null;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  form: FormInstance;
}

const UserModal: React.FC<UserModalProps> = ({
  open,
  editingUser,
  onCancel,
  onSubmit,
  form,
}) => {
  // useEffect removed as form values are controlled by hook

  return (
    <Modal
      title={editingUser ? "Edit User" : "Tambah User"}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Username wajib diisi" }]}
        >
          <Input placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email wajib diisi" },
            { type: "email", message: "Format email tidak valid" },
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        {!editingUser && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Password wajib diisi" },
              { min: 6, message: "Password minimal 6 karakter" },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
        )}

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Role wajib diisi" }]}
        >
          <Select placeholder="Pilih Role">
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="manager">Manager</Select.Option>
            <Select.Option value="user">User</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="is_active" label="Status" valuePropName="checked">
          <Switch checkedChildren="Aktif" unCheckedChildren="Tidak Aktif" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
