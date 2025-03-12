import {
  OrderStatusType,
  PaymentProviderType,
  PaymentStatusType,
} from "@/lib/types";

interface OrderResult {
  id: number;
  orderNumber: string;
  customerPhone: number;
  status: OrderStatusType;
  total: number;
  notes: string | null;
  address: string;
  createdAt: Date;
  updatedAt: Date | null;
  orderDetails: Array<{
    quantity: number;
    product: {
      name: string;
      price: number;
      id: number;
      images: Array<{
        url: string;
      }>;
    };
  }>;
  payments: Array<{
    status: PaymentStatusType;
    provider: PaymentProviderType;
    createdAt: Date;
  }>;
}

interface ShapedOrder {
  id: number;
  orderNumber: string;
  customerPhone: number;
  status: OrderStatusType;
  total: number;
  notes: string | null;
  createdAt: Date;
  address: string;
  updatedAt: Date | null;
  products: Array<{
    quantity: number;
    name: string;
    price: number;
    productId: number;
    imageUrl: string | undefined;
  }>;
  paymentStatus: PaymentStatusType;
  paymentProvider: PaymentProviderType;
}

interface OrderError {
  message: string;
  error: string;
}

export const shapeOrderResult = (
  result: OrderResult | undefined,
): ShapedOrder | OrderError => {
  if (result === undefined) {
    return {
      message: "Adding order failed",
      error: "No order found",
    };
  }
  result.payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (result.payments[0] === undefined) {
    throw new Error("No payment info found");
  }
  return {
    id: result.id,
    orderNumber: result.orderNumber,
    customerPhone: result.customerPhone,
    status: result.status,
    total: result.total,
    notes: result.notes,
    createdAt: result.createdAt,
    address: result.address,
    updatedAt: result.updatedAt,
    products: result.orderDetails.map((orderDetail) => ({
      quantity: orderDetail.quantity,
      name: orderDetail.product.name,
      price: orderDetail.product.price,
      productId: orderDetail.product.id,
      imageUrl: orderDetail.product.images[0]?.url,
    })),
    paymentStatus: result.payments[0]?.status,
    paymentProvider: result.payments[0]?.provider,
  };
};
export const shapeOrderResults = (
  results: OrderResult[] | undefined,
): ShapedOrder[] | OrderError => {
  if (results === undefined) {
    return {
      message: "Adding order failed",
      error: "No order found",
    };
  }

  return results.map((result) => {
    result.payments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    if (result.payments[0] === undefined) {
      throw new Error("No payment info found");
    }
    return {
      id: result.id,
      orderNumber: result.orderNumber,
      customerPhone: result.customerPhone,
      status: result.status,
      total: result.total,
      notes: result.notes,
      address: result.address,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      products: result.orderDetails.map((orderDetail) => ({
        quantity: orderDetail.quantity,
        name: orderDetail.product.name,
        productId: orderDetail.product.id,
        price: orderDetail.product.price,
        imageUrl: orderDetail.product.images[0]?.url,
      })),
      paymentStatus: result.payments[0]?.status,
      paymentProvider: result.payments[0]?.provider,
    };
  });
};
export const getStartOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};