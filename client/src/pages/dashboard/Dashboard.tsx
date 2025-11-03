import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography } from 'antd';
import { TeamOutlined, AppstoreOutlined } from '@ant-design/icons';
import { barangApi } from '../../api/barang';
import { karyawanApi } from '../../api/karyawan';
import type { ColumnsType } from 'antd/es/table';
import type { Barang } from '../../types';
import styled from '@emotion/styled';

const { Title } = Typography;

const DashboardContainer = styled.div`
  .ant-statistic-title {
    font-size: 14px;
  }
`;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    barang: 0,
    karyawan: 0,
  });
  const [recentBarang, setRecentBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [barangData, karyawanData] = await Promise.all([
        barangApi.getAll(1, 5),
        karyawanApi.getAll(1, 5),
      ]);

      setStats({
        barang: barangData.pagination.total,
        karyawan: karyawanData.pagination.total,
      });

      setRecentBarang(barangData.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Barang> = [
    {
      title: 'Nama Barang',
      dataIndex: 'nama_barang',
      key: 'nama_barang',
    },
    {
      title: 'Jenis',
      dataIndex: 'jenis',
      key: 'jenis',
      render: (jenis) => <Tag color="blue">{jenis}</Tag>,
    },
    {
      title: 'Satuan',
      dataIndex: 'satuan',
      key: 'satuan',
    },
    {
      title: 'Stok Minimal',
      dataIndex: 'stok_minimal',
      key: 'stok_minimal',
    },
  ];

  return (
    <DashboardContainer>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic
              title="Total Barang"
              value={stats.barang}
              prefix={<AppstoreOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic
              title="Total Karyawan"
              value={stats.karyawan}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Title level={4}>Barang Terbaru</Title>
        <Table
          columns={columns}
          dataSource={recentBarang}
          rowKey="id_barang"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </DashboardContainer>
  );
};

export default Dashboard;

