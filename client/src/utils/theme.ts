import { theme } from "antd";

export const defaultTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#00A76F", // Fresh Green
    colorInfo: "#00B8D9",
    borderRadius: 8,
    fontSize: 14,
    fontFamily:
      "'Public Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    colorBgLayout: "#F4F6F8",
    colorBgContainer: "#FFFFFF",
  },
  components: {
    Layout: {
      bodyBg: "#F4F6F8",
      headerBg: "rgba(255, 255, 255, 0.8)",
      siderBg: "#FFFFFF",
    },
    Menu: {
      itemBg: "#FFFFFF",
      itemColor: "#637381",
      itemHoverBg: "rgba(0, 167, 111, 0.08)",
      itemSelectedBg: "rgba(0, 167, 111, 0.16)",
      itemSelectedColor: "#00A76F",
      itemHoverColor: "#00A76F",
      itemActiveBg: "rgba(0, 167, 111, 0.16)",
      groupTitleColor: "#919EAB",
    },
    Table: {
      headerBg: "#00A76F",
      headerColor: "#fff",
      headerSplitColor: "transparent",
      rowHoverBg: "rgba(0, 167, 111, 0.08)",
      headerBorderRadius: 8,
    },
    Button: {
      fontWeight: 600,
      controlHeight: 40,
      defaultShadow: "0 2px 0 rgba(0, 0, 0, 0.02)",
      primaryShadow: "0 8px 16px rgba(0, 167, 111, 0.24)",
    },
    Card: {
      headerFontSize: 18,
      headerFontWeight: 600,
      borderRadiusLG: 12,
    },
    Typography: {
      fontFamilyCode: "'Public Sans', sans-serif",
    },
  },
};
