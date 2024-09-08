import { Exclude, Expose } from 'class-transformer';
import { Product } from './entities/product.entity';

export class ProductDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  discountPrice?: number;

  @Expose()
  stockQuantity: number;

  @Expose()
  tags: string[];

  @Expose()
  images: string[];

  @Expose()
  isFeatured: boolean;

  @Expose()
  isPublished: boolean;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ProductDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class ProductListSerializer {
  @Expose()
  @Exclude()
  _id: string; 

  @Expose()
  title: string;

  @Expose()
  price: number;

  @Expose()
  discountPrice?: number;

  @Expose()
  stockQuantity: number;

  @Expose()
  tags: string[];

  @Expose()
  images: string[];

  @Expose()
  isFeatured: boolean;

  @Expose()
  isPublished: boolean;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ProductListSerializer>) {
    Object.assign(this, partial);
  }
}

export class AdminProductDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  discountPrice?: number;

  @Expose()
  stockQuantity: number;

  @Expose()
  tags: string[];

  @Expose()
  images: string[];

  @Expose()
  isFeatured: boolean;

  @Expose()
  isPublished: boolean;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AdminProductDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class AdminProductListSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  title: string;

  @Expose()
  price: number;

  @Expose()
  discountPrice?: number;

  @Expose()
  stockQuantity: number;

  @Expose()
  tags: string[];

  @Expose()
  images: string[];

  @Expose()
  isFeatured: boolean;

  @Expose()
  isPublished: boolean;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AdminProductListSerializer>) {
    Object.assign(this, partial);
  }
}

export class VendorProductDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  discountPrice?: number;

  @Expose()
  stockQuantity: number;

  @Expose()
  tags: string[];

  @Expose()
  images: string[];

  @Expose()
  isFeatured: boolean;

  @Expose()
  isPublished: boolean;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<VendorProductDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class VendorProductListSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  title: string;

  @Expose()
  price: number;

  @Expose()
  discountPrice?: number;

  @Expose()
  stockQuantity: number;

  @Expose()
  tags: string[];

  @Expose()
  images: string[];

  @Expose()
  isFeatured: boolean;

  @Expose()
  isPublished: boolean;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<VendorProductListSerializer>) {
    Object.assign(this, partial);
  }
}