import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Table,
  InputNumber,
  Row,
  Col,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import productService from "../../api/product";
import supplierService from "../../api/supplier";
import type { Product, Supplier } from "../../types";
import dayjs from "dayjs";

interface StockInModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  form: any;
  loading?: boolean;
}

const { Text } = Typography;

const StockInModal: React.FC<StockInModalProps> = ({
  open,
  onCancel,
  onSubmit,
  form,
  loading,
}) => {
  const [productList, setProductList] = useState<Product[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  useEffect(() => {
    if (open) {
      fetchProductList();
      fetchSupplierList();
    }
  }, [open]);

  const fetchProductList = async () => {
    try {
      const data = await productService.getAll(1, 1000);
      setProductList(data.data);
    } catch (error) {
      console.error("Failed to fetch product list");
    }
  };

  const fetchSupplierList = async () => {
    try {
      const data = await supplierService.getAll(1, 1000);
      setSupplierList(data.data);
    } catch (error) {
      console.error("Failed to fetch supplier list");
    }
  };

  return (
    <Modal
      title="Add Stock In Transaction"
      open={open}
      onOk={form.submit}
      onCancel={onCancel}
      width={950}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Transaction Date"
              rules={[{ required: true, message: "Select transaction date" }]}
              initialValue={dayjs()}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="supplier_id"
              label="Supplier"
              rules={[{ required: true, message: "Select supplier" }]}
            >
              <Select
                placeholder="Select Supplier"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {supplierList.map((supplier) => (
                  <Select.Option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Notes/Description">
          <Input.TextArea rows={2} placeholder="Additional information" />
        </Form.Item>

        <Form.List
          name="details"
          rules={[
            {
              validator: async (_, names) => {
                if (!names || names.length < 1) {
                  return Promise.reject(
                    new Error("At least one product must be selected")
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text strong>Product Items</Text>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add Item
                </Button>
              </div>

              <Table
                dataSource={fields}
                pagination={false}
                rowKey="key"
                size="small"
                columns={[
                  {
                    title: "Product",
                    key: "product_id",
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "product_id"]}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "Select product" }]}
                      >
                        <Select
                          placeholder="Select Product"
                          style={{ width: 280 }}
                          showSearch
                          optionFilterProp="children"
                        >
                          {productList.map((item) => (
                            <Select.Option key={item.id} value={item.id}>
                              {item.name} (Stock: {item.stock} {item.unit})
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Quantity",
                    key: "quantity",
                    width: 120,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "quantity"]}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "Req" }]}
                      >
                        <InputNumber
                          min={1}
                          placeholder="Qty"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Unit Price",
                    key: "unit_price",
                    width: 150,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "unit_price"]}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "Req" }]}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Price"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) =>
                            value
                              ? (value.replace(/\$\s?|(,*)/g, "") as any)
                              : ""
                          }
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Expiry Date",
                    key: "expiry_date",
                    width: 150,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "expiry_date"]}
                        style={{ marginBottom: 0 }}
                      >
                        <DatePicker
                          placeholder="Exp Date"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "",
                    key: "action",
                    width: 50,
                    render: (_, field) => (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    ),
                  },
                ]}
                scroll={{ x: "max-content" }}
              />
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default StockInModal;
