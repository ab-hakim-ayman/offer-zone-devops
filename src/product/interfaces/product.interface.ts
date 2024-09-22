import { ObjectId } from 'mongodb';
import { Categories } from 'src/common/enums/categories.enum';

export interface IProduct {
  _id: ObjectId;
  title: string;
  description: string;
  category: Categories;
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
