import { useState, useEffect, useCallback } from "react";
import { Form, message } from "antd";
import type { Employee } from "../../types";
import employeeService from "../../api/employee";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);

  // Modal & Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Employee | null>(null);
  const [form] = Form.useForm();
  const [formFilter] = Form.useForm();

  const fetchEmployees = useCallback(
    async (page = 1, limit = 10, search = "", status?: boolean) => {
      setLoading(true);
      try {
        let response;
        if (search) {
          response = await employeeService.search(search, page, limit);
        } else {
          response = await employeeService.getAll(page, limit, status);
        }

        const data = response;
        setEmployees(data.data);
        setPagination({
          current: data.pagination.page,
          pageSize: data.pagination.limit,
          total: data.pagination.total,
        });
      } catch (error: any) {
        message.error(
          error.response?.data?.message || "Failed to fetch employees"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchEmployees(
      pagination.current,
      pagination.pageSize,
      isSearching ? searchValue : "",
      activeFilter
    );
  }, [
    fetchEmployees,
    pagination.current,
    pagination.pageSize,
    isSearching,
    activeFilter,
  ]);

  const handleSearch = () => {
    setIsSearching(!!searchValue);
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusFilter = (status: boolean | undefined) => {
    setActiveFilter(status);
    setPagination({ ...pagination, current: 1 });
  };

  const deleteEmployee = async (id: number) => {
    try {
      await employeeService.delete(id);
      message.success("Employee deleted successfully");
      fetchEmployees(
        pagination.current,
        pagination.pageSize,
        isSearching ? searchValue : "",
        activeFilter
      );
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to delete employee"
      );
    }
  };

  const changePage = (page: number, pageSize: number) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item: Employee) => {
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
        await employeeService.update(editingItem.id, values);
        message.success("Employee updated successfully");
      } else {
        await employeeService.create(values);
        message.success("Employee created successfully");
      }
      setModalVisible(false);
      fetchEmployees(
        pagination.current,
        pagination.pageSize,
        isSearching ? searchValue : "",
        activeFilter
      );
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to save employee");
    }
  };

  const handleFilterSubmit = (values: any) => {
    fetchEmployees(
      pagination.current,
      pagination.pageSize,
      isSearching ? searchValue : "",
      values.status
    );
  };

  return {
    employees,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    activeFilter,
    handleSearch,
    handleStatusFilter,
    fetchEmployees,
    deleteEmployee,
    changePage,
    modalVisible,
    editingItem,
    form,
    formFilter,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
    handleFilterSubmit,
  };
};
