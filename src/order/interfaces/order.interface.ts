import { Product } from 'src/product/entities/product.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export interface IOrder {
  _id: string;
  invoice: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  products: Product[];
  status: OrderStatus;
  price: number;
  profit: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
