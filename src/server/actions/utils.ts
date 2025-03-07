interface OrderResult {
  id: number;
  orderNumber: string;
  customerPhone: number;
  status: string;
  total: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  orderDetails: Array<{
    quantity: number;
    product: {
      name: string;
      id: number;
      images: Array<{
        url: string;
      }>;
    };
  }>;
  payments: Array<{
    status: string;
    provider: string;
  }>;
}

interface ShapedOrder {
  id: number;
  orderNumber: string;
  customerPhone: number;
  status: string;
  total: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  products: Array<{
    quantity: number;
    name: string;
    id: number;
    imageUrl: string | undefined;
  }>;
  paymentStatus: string[];
  paymentProvider: string[];
}

interface OrderError {
  message: string;
  error: string;
}

export const shapeOrderResult=(
  result: OrderResult | undefined,
): ShapedOrder | OrderError =>{
  if (result === undefined) {
    return {
      message: "Adding order failed",
      error: "No order found",
    };
  }

  return {
    id: result.id,
    orderNumber: result.orderNumber,
    customerPhone: result.customerPhone,
    status: result.status,
    total: result.total,
    notes: result.notes,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    products: result.orderDetails.map((orderDetail) => ({
      quantity: orderDetail.quantity,
      name: orderDetail.product.name,
      id: orderDetail.product.id,
      imageUrl: orderDetail.product.images[0]?.url,
    })),
    paymentStatus: result.payments.map((payment) => payment.status),
    paymentProvider: result.payments.map((payment) => payment.provider),
  };
}
export const shapeOrderResults=(
  result: OrderResult[] | undefined,
): ShapedOrder[] | OrderError =>{
  if (result === undefined) {
    return {
      message: "Adding order failed",
      error: "No order found",
    };
  }

  return result.map((result)=>( {
    id: result.id,
    orderNumber: result.orderNumber,
    customerPhone: result.customerPhone,
    status: result.status,
    total: result.total,
    notes: result.notes,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    products: result.orderDetails.map((orderDetail) => ({
      quantity: orderDetail.quantity,
      name: orderDetail.product.name,
      id: orderDetail.product.id,
      imageUrl: orderDetail.product.images[0]?.url,
    })),
    paymentStatus: result.payments.map((payment) => payment.status),
    paymentProvider: result.payments.map((payment) => payment.provider),
  }));
}
