import { useState, useEffect, useCallback } from "react";
import { Form, message } from "antd";
import type { Supplier } from "../../types";
import supplierService from "../../api/supplier";

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Modal & Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  const fetchSuppliers = useCallback(
    async (page = 1, limit = 10, search = "") => {
      setLoading(true);
      try {
        let response;
        if (search) {
          response = await supplierService.search(search, page, limit);
        } else {
          response = await supplierService.getAll(page, limit);
        }

        setSuppliers(response.data);
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        });
      } catch (error: any) {
        message.error(
          error.response?.data?.message || "Failed to fetch suppliers"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSuppliers(
      pagination.current,
      pagination.pageSize,
      isSearching ? searchValue : ""
    );
  }, [fetchSuppliers, pagination.current, pagination.pageSize, isSearching]);

  const handleSearch = () => {
    setIsSearching(!!searchValue);
    setPagination({ ...pagination, current: 1 });
  };

  const deleteSupplier = async (id: number) => {
    try {
      await supplierService.delete(id);
      message.success("Supplier deleted successfully");
      fetchSuppliers(
        pagination.current,
        pagination.pageSize,
        isSearching ? searchValue : ""
      );
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to delete supplier"
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

  const handleEdit = (item: Supplier) => {
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
        await supplierService.update(editingItem.id, values);
        message.success("Supplier updated successfully");
      } else {
        await supplierService.create(values);
        message.success("Supplier created successfully");
      }
      setModalVisible(false);
      fetchSuppliers(
        pagination.current,
        pagination.pageSize,
        isSearching ? searchValue : ""
      );
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to save supplier");
    }
  };

  return {
    suppliers,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchSuppliers,
    handleSearch,
    deleteSupplier,
    changePage,
    modalVisible,
    editingItem,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  };
};
