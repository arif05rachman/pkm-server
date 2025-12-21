import { theme } from "antd";
import type { ThemeConfig } from "antd";

export const getThemeConfig = (mode: "light" | "dark"): ThemeConfig => ({
  algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: "#00A76F", // Fresh Green
    colorInfo: "#00B8D9",
    borderRadius: 8,
    fontSize: 14,
    fontFamily:
      "'Public Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    colorBgLayout: mode === "dark" ? "#161C24" : "#F4F6F8",
    colorBgContainer: mode === "dark" ? "#212B36" : "#FFFFFF",
  },
  components: {
    Layout: {
      bodyBg: mode === "dark" ? "#161C24" : "#F4F6F8",
      headerBg:
        mode === "dark" ? "rgba(22, 28, 36, 0.8)" : "rgba(255, 255, 255, 0.8)",
      siderBg: mode === "dark" ? "#161C24" : "#FFFFFF",
    },
    Menu: {
      itemBg: "transparent",
      itemColor: mode === "dark" ? "#919EAB" : "#637381",
      itemHoverBg: mode === "dark" ? "#1E353B" : "#F2FBF8",
      itemSelectedBg: mode === "dark" ? "#1C3F3F" : "#E6F6F1",
      itemSelectedColor: "#00A76F",
      itemHoverColor: "#00A76F",
      itemActiveBg: mode === "dark" ? "#1C3F3F" : "#E6F6F1",
      groupTitleColor: "#919EAB",
    },
    Table: {
      headerBg: "#00A76F",
      headerColor: "#fff",
      headerSplitColor: "transparent",
      rowHoverBg: mode === "dark" ? "#1E353B" : "#F2FBF8",
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
      borderRadiusLG: 12,
      colorBgContainer: mode === "dark" ? "#212B36" : "#FFFFFF",
    },
    Typography: {
      fontFamilyCode: "'Public Sans', sans-serif",
    },
  },
});

export const defaultTheme = getThemeConfig("light");
