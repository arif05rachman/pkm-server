import { useState, useEffect, useCallback } from "react";
import { Form, message } from "antd";
import type { Product, Category } from "../../types";
import productService from "../../api/product";
import categoryService from "../../api/category";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    type: undefined as string | undefined,
    unit: undefined as string | undefined,
    category: undefined as number | undefined,
  });

  // Modal & Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAll(1, 100);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  const fetchProducts = useCallback(
    async (page = 1, limit = 10, search = "", currentFilters = filters) => {
      setLoading(true);
      try {
        let response;
        if (search) {
          response = await productService.search(search, page, limit);
        } else {
          response = await productService.getAll(
            page,
            limit,
            currentFilters.type,
            currentFilters.unit,
            currentFilters.category
          );
        }

        const data = response;
        setProducts(data.data);
        setPagination({
          current: data.pagination.page,
          pageSize: data.pagination.limit,
          total: data.pagination.total,
        });
      } catch (error: any) {
        message.error(
          error.response?.data?.message || "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(
      pagination.current,
      pagination.pageSize,
      isSearching ? searchValue : "",
      filters
    );
  }, [
    fetchProducts,
    pagination.current,
    pagination.pageSize,
    isSearching,
    filters,
  ]);

  const handleSearch = () => {
    setIsSearching(!!searchValue);
    setPagination({ ...pagination, current: 1 });
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, current: 1 });
  };

  const deleteProduct = async (id: number) => {
    try {
      await productService.delete(id);
      message.success("Product deleted successfully");
      fetchProducts(
        pagination.current,
        pagination.pageSize,
        isSearching ? searchValue : "",
        filters
      );
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to delete product"
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

  const handleEdit = (item: Product) => {
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
        await productService.update(editingItem.id, values);
        message.success("Product updated successfully");
      } else {
        await productService.create(values);
        message.success("Product created successfully");
      }
      setModalVisible(false);
      fetchProducts(
        pagination.current,
        pagination.pageSize,
        isSearching ? searchValue : "",
        filters
      );
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to save product");
    }
  };

  return {
    products,
    categories,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    isSearching,
    filters,
    handleSearch,
    handleFilterChange,
    fetchProducts,
    deleteProduct,
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
