import { useState, useEffect, useCallback, useRef } from "react";
import { App } from "antd";
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

interface UseKaryawanReturn {
  karyawan: Karyawan[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  searchValue: string;
  setSearchValue: (value: string) => void;
  fetchData: () => Promise<void>;
  handleSearch: (value: string) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleSubmit: (
    values: KaryawanFormValues,
    editingItem: Karyawan | null
  ) => Promise<boolean>;
  setPagination: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
      total: number;
    }>
  >;
}

export const useKaryawan = (): UseKaryawanReturn => {
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
    async (value: string) => {
      if (!value) {
        fetchData();
        return;
      }
      setLoading(true);
      try {
        const data = await karyawanApi.search(value, 1, pagination.pageSize);
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
    [pagination.pageSize, fetchData, message]
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

  const handleSubmit = useCallback(
    async (
      values: KaryawanFormValues,
      editingItem: Karyawan | null
    ): Promise<boolean> => {
      try {
        if (editingItem) {
          await karyawanApi.update(editingItem.id_karyawan, values);
          message.success("Karyawan berhasil diupdate");
        } else {
          await karyawanApi.create(values);
          message.success("Karyawan berhasil ditambahkan");
        }
        fetchData();
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : undefined;
        message.error(errorMessage || "Gagal menyimpan data");
        return false;
      }
    },
    [fetchData, message]
  );

  return {
    karyawan,
    loading,
    pagination,
    searchValue,
    setSearchValue,
    fetchData,
    handleSearch,
    handleDelete,
    handleSubmit,
    setPagination,
  };
};
