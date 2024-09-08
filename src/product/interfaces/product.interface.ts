import { ObjectId } from 'mongodb';

export interface IProduct {
  _id: ObjectId;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  tags: string[];
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
