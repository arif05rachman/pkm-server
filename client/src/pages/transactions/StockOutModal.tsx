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
import type { Product } from "../../types";
import dayjs from "dayjs";

interface StockOutModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  form: any;
  loading?: boolean;
}

const { Text } = Typography;

const StockOutModal: React.FC<StockOutModalProps> = ({
  open,
  onCancel,
  onSubmit,
  form,
  loading,
}) => {
  const [productList, setProductList] = useState<Product[]>([]);

  useEffect(() => {
    if (open) {
      fetchProductList();
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

  return (
    <Modal
      title="Add Stock Out Transaction"
      open={open}
      onOk={form.submit}
      onCancel={onCancel}
      width={800}
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
              name="destination"
              label="Destination / Unit"
              rules={[{ required: true, message: "Enter destination" }]}
            >
              <Input placeholder="e.g. Ward A, Emergency Room" />
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
                          style={{ width: 350 }}
                          showSearch
                          optionFilterProp="children"
                        >
                          {productList.map((item) => (
                            <Select.Option
                              key={item.id}
                              value={item.id}
                              disabled={item.stock <= 0}
                            >
                              {item.name} (Available: {item.stock} {item.unit})
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Quantity",
                    key: "quantity",
                    width: 150,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "quantity"]}
                        style={{ marginBottom: 0 }}
                        rules={[
                          { required: true, message: "Req" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const productId = getFieldValue([
                                "details",
                                field.name,
                                "product_id",
                              ]);
                              const product = productList.find(
                                (p) => p.id === productId
                              );
                              if (product && value > product.stock) {
                                return Promise.reject(
                                  new Error("Insufficent stock!")
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
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

export default StockOutModal;
