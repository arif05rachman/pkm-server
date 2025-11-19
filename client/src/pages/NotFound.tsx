import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Maaf, halaman yang Anda cari tidak ditemukan."
      extra={
        <Button
          type="primary"
          icon={<HomeOutlined />}
          onClick={() => navigate("/dashboard")}
        >
          Kembali ke Dashboard
        </Button>
      }
    />
  );
};

export default NotFound;

