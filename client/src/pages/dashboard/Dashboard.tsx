import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Typography } from "antd";
import { TeamOutlined, AppstoreOutlined } from "@ant-design/icons";
import productService from "../../api/product";
import employeeService from "../../api/employee";
import type { ColumnsType } from "antd/es/table";
import type { Product } from "../../types";
import styled from "@emotion/styled";

const { Title } = Typography;

const DashboardContainer = styled.div`
  .ant-statistic-title {
    font-size: 14px;
  }
`;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    employees: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productData, employeeData] = await Promise.all([
        productService.getAll(1, 5),
        employeeService.getAll(1, 5),
      ]);

      setStats({
        products: productData.pagination.total,
        employees: employeeData.pagination.total,
      });

      setRecentProducts(productData.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Min Stock",
      dataIndex: "min_stock",
      key: "min_stock",
    },
  ];

  return (
    <DashboardContainer>
      <Title level={2}>Dashboard Overview</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.products}
              prefix={<AppstoreOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic
              title="Total Employees"
              value={stats.employees}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Title level={4}>Recently Added Products</Title>
        <Table
          columns={columns}
          dataSource={recentProducts}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          scroll={{ x: "max-content" }}
        />
      </Card>
    </DashboardContainer>
  );
};

export default Dashboard;
