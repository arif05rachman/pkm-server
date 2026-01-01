import dayjs from "dayjs";
import "dayjs/locale/en";

dayjs.locale("en");

export const formatDate = (
  date: string | Date,
  format = "DD MMMM YYYY HH:mm"
): string => {
  return dayjs(date).format(format);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("id-ID").format(num);
};

export const getStatusBadgeProps = (status: boolean) => {
  return status
    ? { status: "success" as const, text: "Active" }
    : { status: "error" as const, text: "Inactive" };
};

export const getTypeColor = (
  type: "Medicine" | "Medical Device" | "Medical Material"
): string => {
  const colors = {
    Medicine: "#52c41a",
    "Medical Device": "#1890ff",
    "Medical Material": "#fa8c16",
  };
  return colors[type];
};
