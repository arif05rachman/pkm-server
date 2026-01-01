import { useState, useEffect, useCallback } from "react";
import { App, Form } from "antd";
import usersApi from "../../api/users";
import authService from "../../api/auth";
import type { User } from "../../types";

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState("");

  // Modal & Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll(
        pagination.current,
        pagination.pageSize
      );
      // Filter by search if needed
      let filteredData = data.data;
      if (searchValue) {
        filteredData = data.data.filter(
          (user: User) =>
            user.username.toLowerCase().includes(searchValue.toLowerCase()) ||
            user.email.toLowerCase().includes(searchValue.toLowerCase())
        );
      }
      setUsers(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch {
      message.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchValue, message]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    try {
      await usersApi.delete(id);
      message.success("User berhasil dihapus");
      fetchUsers();
      return true;
    } catch {
      message.error("Gagal menghapus user");
      return false;
    }
  };

  const updateUser = async (id: number, values: Partial<User>) => {
    try {
      await usersApi.update(id, values);
      message.success("User berhasil diupdate");
      fetchUsers();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "Gagal menyimpan data");
      return false;
    }
  };

  const addUser = async (values: any) => {
    try {
      await authService.register(values);
      message.success("User berhasil ditambahkan");
      fetchUsers();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "Gagal menambahkan user");
      return false;
    }
  };

  // Modal Handlers
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      role: "user",
      is_active: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      role: record.role,
      is_active: record.is_active,
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let success = false;
      if (editingUser) {
        success = await updateUser(editingUser.id, values);
      } else {
        success = await addUser(values);
      }

      if (success) {
        setModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  const changePage = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  };

  return {
    users,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchUsers,
    handleSearch,
    deleteUser,
    changePage,
    // Modal & Form exports
    modalVisible,
    editingUser,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  };
};
