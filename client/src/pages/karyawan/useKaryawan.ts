import { useState, useEffect, useCallback, useRef } from "react";
import { App, Form } from "antd";
import { karyawanApi } from "@/api/karyawan";
import type { Karyawan } from "@/types";

interface KaryawanFormValues {
  nama_karyawan: string;
  jabatan: string;
  nip?: string;
  no_hp?: string;
  alamat?: string;
  status_aktif?: boolean;
}

export const useKaryawan = () => {
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { message } = App.useApp();
  const paginationRef = useRef(pagination);

  // Modal & Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Karyawan | null>(null);
  const [form] = Form.useForm();

  // Keep ref in sync with state
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentPagination = paginationRef.current;
      const data = await karyawanApi.getAll(
        currentPagination.current,
        currentPagination.pageSize
      );
      setKaryawan(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch {
      message.error("Gagal memuat data karyawan");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const handleSearch = useCallback(
    async (value?: string) => {
      // If value is provided use it, otherwise use state
      const searchVal = value !== undefined ? value : searchValue;

      if (!searchVal) {
        fetchData();
        return;
      }
      setLoading(true);
      try {
        const data = await karyawanApi.search(
          searchVal,
          1,
          pagination.pageSize
        );
        setKaryawan(data.data);
        setPagination((prev) => ({
          ...prev,
          current: 1,
          total: data.pagination.total,
        }));
      } catch {
        message.error("Gagal mencari karyawan");
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize, fetchData, message, searchValue]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await karyawanApi.delete(id);
        message.success("Karyawan berhasil dihapus");
        fetchData();
      } catch {
        message.error("Gagal menghapus karyawan");
      }
    },
    [fetchData, message]
  );

  const createKaryawan = async (values: KaryawanFormValues) => {
    try {
      await karyawanApi.create(values);
      message.success("Karyawan berhasil ditambahkan");
      fetchData();
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      message.error(errorMessage || "Gagal menambahkan karyawan");
      return false;
    }
  };

  const updateKaryawan = async (id: number, values: KaryawanFormValues) => {
    try {
      await karyawanApi.update(id, values);
      message.success("Karyawan berhasil diupdate");
      fetchData();
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      message.error(errorMessage || "Gagal mengupdate karyawan");
      return false;
    }
  };

  // Modal Handlers
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Karyawan) => {
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
        success = await updateKaryawan(editingItem.id_karyawan, values);
      } else {
        success = await createKaryawan(values);
      }

      if (success) {
        setModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  return {
    karyawan,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchData,
    handleSearch,
    handleDelete,
    setPagination,
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
