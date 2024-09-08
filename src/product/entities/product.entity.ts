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
  purchasePrice: number;

  @Column({ type: 'float' })
  sellPrice: number;

  @Column({ type: 'float', nullable: true })
  discountPrice?: number;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ type: 'text', default: [] })
  tags: string[];

  @Column({ type: 'text' })
  images: string[];

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

