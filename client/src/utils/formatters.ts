import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export const formatDate = (date: string | Date, format = 'DD MMMM YYYY HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const getStatusBadgeProps = (status: boolean) => {
  return status
    ? { status: 'success' as const, text: 'Aktif' }
    : { status: 'error' as const, text: 'Tidak Aktif' };
};

export const getJenisColor = (jenis: 'Obat' | 'Alkes' | 'BMHP'): string => {
  const colors = {
    Obat: '#52c41a',
    Alkes: '#1890ff',
    BMHP: '#fa8c16',
  };
  return colors[jenis];
};

