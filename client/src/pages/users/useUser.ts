import { useState, useEffect, useCallback } from "react";
import { App } from "antd";
import { usersApi } from "../../api/users";
import { authApi } from "../../api/auth";
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
          (user) =>
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
    // fetchUsers will be triggered by useEffect when pagination changes
    // But if pagination doesn't change (still 1), we might need to trigger it.
    // However, in the original code, handleSearch called fetchData directly.
    // Since fetchUsers depends on searchValue, and searchValue is state,
    // simply changing searchValue might not trigger useEffect if we don't include it in deps
    // OR we can just rely on the button click to call handleSearch which triggers fetchUsers?
    // Actually, looking at original code:
    // useEffect depends on [pagination.current, pagination.pageSize].
    // handleSearch sets pagination current to 1 AND calls fetchData().

    // In this hook:
    // If I add searchValue to dependency array of fetchUsers, then changing searchValue will trigger fetchUsers?
    // The original code `fetchData` uses `searchValue` state.
    // But `useEffect` ONLY watched pagination.

    // Let's mimic original behavior:
    // useEffect(() => { fetchData() }, [pagination.current, pagination.pageSize]);
    // handleSearch -> setPagination -> fetchData

    // If I call fetchUsers() here, it uses the closure's state? No, it uses the state from the render.
    // It should be fine as long as we assume React batches or we await.
    fetchUsers();
  };

  // NOTE: The original code's useEffect ONLY watched pagination.
  // If I add searchValue to useCallback deps, and then to useEffect deps, it will auto-search on type.
  // The original code had an onChange that called fetchData if value is empty.
  // And a explicit handleSearch button.

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
      await authApi.register(values);
      message.success("User berhasil ditambahkan");
      fetchUsers();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "Gagal menambahkan user");
      return false;
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
    updateUser,
    addUser,
    changePage, // helper for Table onChange
  };
};
