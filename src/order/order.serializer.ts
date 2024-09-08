import { Exclude, Expose, Type } from 'class-transformer';
import { Product } from 'src/product/entities/product.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class OrderDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  invoice: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  @Type(() => Product)
  products: Product[];

  @Expose()
  status: OrderStatus;

  @Expose()
  price: number;

  @Expose()
  profit: number;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<OrderDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class OrderListSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  invoice: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  @Type(() => Product)
  products: Product[];

  @Expose()
  status: OrderStatus;

  @Expose()
  price: number;

  @Expose()
  profit: number;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<OrderListSerializer>) {
    Object.assign(this, partial);
  }
}


export class AdminOrderDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  invoice: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  @Type(() => Product)
  products: Product[];

  @Expose()
  status: OrderStatus;

  @Expose()
  price: number;

  @Expose()
  profit: number;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AdminOrderDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class AdminOrderListSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  invoice: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  @Type(() => Product)
  products: Product[];

  @Expose()
  status: OrderStatus;

  @Expose()
  price: number;

  @Expose()
  profit: number;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AdminOrderListSerializer>) {
    Object.assign(this, partial);
  }
}


export class VendorOrderDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  invoice: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  @Type(() => Product)
  products: Product[];

  @Expose()
  status: OrderStatus;

  @Expose()
  price: number;

  @Expose()
  profit: number;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<VendorOrderDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class VendorOrderListSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  invoice: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  @Type(() => Product)
  products: Product[];

  @Expose()
  status: OrderStatus;

  @Expose()
  price: number;

  @Expose()
  profit: number;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<VendorOrderListSerializer>) {
    Object.assign(this, partial);
  }
}
