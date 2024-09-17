import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('products')
export class Product {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  title: string;

  @Column({ type: 'string' })
  description: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ type: 'text', default: [] })
  tags: string[];

  @Column({ type: 'text' })
  images: string[];

  @Column({ type: 'string' })
  vendorEmail: string;

  @Column({ type: 'text' })
  vendorPhone: string;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: false })
  isArchived: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}