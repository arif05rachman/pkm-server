import { theme } from 'antd';

export const defaultTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Layout: {
      bodyBg: '#f0f2f5',
      headerBg: '#001529',
    },
    Menu: {
      itemBg: '#001529',
      itemColor: 'rgba(255, 255, 255, 0.85)',
      itemHoverBg: '#1890ff',
      itemSelectedBg: '#1890ff',
      itemSelectedColor: '#fff',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#262626',
    },
  },
};

