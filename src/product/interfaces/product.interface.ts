import { ObjectId } from 'mongodb';
import { Category } from 'src/common/enums/category.enum';

export interface IProduct {
  _id: ObjectId;
  title: string;
  description: string;
  category: Category;
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
