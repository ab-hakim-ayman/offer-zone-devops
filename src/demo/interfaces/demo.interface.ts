import { ObjectId } from 'mongodb';

export interface IDemo {
  _id: ObjectId;
  name: string;
  description: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
