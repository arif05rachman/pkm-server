import { useState, useEffect, useCallback } from "react";
import { Form, message } from "antd";
import type { User, Employee } from "../../types";
import userService from "../../api/users";
import employeeService from "../../api/employee";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal & Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [formFilter] = Form.useForm();

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeeService.getAll(1, 100, true);
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const response = await userService.getAll(page, limit, search);
      setUsers(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize, searchValue);
  };

  useEffect(() => {
    fetchUsers(pagination.current, pagination.pageSize, searchValue);
    fetchEmployees();
  }, [fetchUsers, fetchEmployees, pagination.current, pagination.pageSize]);

  const deleteUser = async (id: number) => {
    try {
      await userService.delete(id);
      message.success("User deleted successfully");
      fetchUsers(pagination.current, pagination.pageSize, searchValue);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const changePage = (page: number, pageSize: number) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  const handleEdit = (item: User) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await userService.update(editingItem.id, values);
        message.success("User updated successfully");
      }
      setModalVisible(false);
      fetchUsers(pagination.current, pagination.pageSize, searchValue);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to save user");
    }
  };

  return {
    users,
    employees,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    handleSearch,
    fetchUsers,
    deleteUser,
    changePage,
    modalVisible,
    editingItem,
    form,
    formFilter,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  };
};
