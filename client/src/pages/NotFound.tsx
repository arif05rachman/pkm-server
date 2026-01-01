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
      subTitle="Sorry, the page you are looking for does not exist."
      extra={
        <Button
          type="primary"
          icon={<HomeOutlined />}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      }
    />
  );
};

export default NotFound;
