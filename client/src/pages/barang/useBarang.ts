import { useState, useEffect, useCallback } from "react";
import { App, Form } from "antd";
import { barangApi } from "../../api/barang";
import type { Barang } from "../../types";

export const useBarang = () => {
  const [barang, setBarang] = useState<Barang[]>([]);
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
  const [editingItem, setEditingItem] = useState<Barang | null>(null);
  const [form] = Form.useForm();

  const fetchBarang = useCallback(async () => {
    setLoading(true);
    try {
      // If searchValue is present, use search API
      let data;
      if (searchValue) {
        data = await barangApi.search(
          searchValue,
          pagination.current,
          pagination.pageSize
        );
      } else {
        data = await barangApi.getAll(pagination.current, pagination.pageSize);
      }

      setBarang(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch {
      message.error("Gagal memuat data barang");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchValue, message]);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchBarang();
  };

  const deleteBarang = async (id: number) => {
    try {
      await barangApi.delete(id);
      message.success("Barang berhasil dihapus");
      fetchBarang();
      return true;
    } catch {
      message.error("Gagal menghapus barang");
      return false;
    }
  };

  const createBarang = async (
    values: Omit<Barang, "id_barang" | "created_at" | "updated_at">
  ) => {
    try {
      await barangApi.create(values);
      message.success("Barang berhasil ditambahkan");
      fetchBarang();
      return true;
    } catch (err: any) {
      message.error(err.response?.data?.message || "Gagal menambahkan barang");
      return false;
    }
  };

  const updateBarang = async (id: number, values: Partial<Barang>) => {
    try {
      await barangApi.update(id, values);
      message.success("Barang berhasil diupdate");
      fetchBarang();
      return true;
    } catch (err: any) {
      message.error(err.response?.data?.message || "Gagal mengupdate barang");
      return false;
    }
  };

  // Modal Handlers
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Barang) => {
    setEditingItem(record);
    form.setFieldsValue(record);
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
      if (editingItem) {
        success = await updateBarang(editingItem.id_barang, values);
      } else {
        success = await createBarang(values);
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
    barang,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchBarang,
    handleSearch,
    deleteBarang,
    changePage,
    // Modal & Form
    modalVisible,
    editingItem,
    form,
    handleAdd,
    handleEdit,
    handleModalCancel,
    handleSubmit,
  };
};
