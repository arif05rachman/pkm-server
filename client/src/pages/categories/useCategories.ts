import { useState, useEffect, useCallback } from "react";
import { Form, message } from "antd";
import type { Category } from "../../types";
import categoryService from "../../api/category";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(
    async (page = 1, limit = 10, search = "") => {
      setLoading(true);
      try {
        let response;
        if (search) {
          response = await categoryService.search(search, page, limit);
        } else {
          response = await categoryService.getAll(page, limit);
        }

        const { data, pagination: pagin } = response.data;
        setCategories(data);
        setPagination({
          current: pagin.page,
          pageSize: pagin.limit,
          total: pagin.total,
        });
      } catch (error: any) {
        message.error(
          error.response?.data?.message || "Failed to fetch categories"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCategories(
      pagination.current,
      pagination.pageSize,
      isSearching ? searchValue : ""
    );
  }, [fetchCategories, pagination.current, pagination.pageSize, isSearching]);

  const handleSearch = () => {
    setIsSearching(!!searchValue);
    setPagination({ ...pagination, current: 1 });
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryService.delete(id);
      message.success("Category deleted successfully");
      fetchCategories(
        pagination.current,
        pagination.pageSize,
        isSearching ? searchValue : ""
      );
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  };

  const changePage = (page: number, pageSize: number) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  // Modal handlers
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item: Category) => {
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
        await categoryService.update(editingItem.id, values);
        message.success("Category updated successfully");
      } else {
        await categoryService.create(values);
        message.success("Category created successfully");
      }
      setModalVisible(false);
      fetchCategories(
        pagination.current,
        pagination.pageSize,
        isSearching ? searchValue : ""
      );
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to save category");
    }
  };

  return {
    categories,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchCategories,
    handleSearch,
    deleteCategory,
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
