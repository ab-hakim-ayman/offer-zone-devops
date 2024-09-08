import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ProductInOrder } from './product-in-order.entity';



@Entity()
export class Order {
  @ObjectIdColumn()
  _id: string;

  @Column({ nullable: false })
  invoice: string;

  @Column({ nullable: false })
  @IsString()
  name: string;

  @Column({ nullable: false })
  @IsString()
  email: string;

  @Column({ nullable: false })
  @IsString()
  phone: string;

  @Column({ nullable: false })
  @IsString()
  address: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductInOrder)
  @Column('jsonb', { nullable: false })
  products: ProductInOrder[];

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.InCart,
  })
  status: OrderStatus
  
  @Column({ type: 'float' })
  @IsNumber()
  price: number;

  @Column({ type: 'float' })
  @IsNumber()
  profit: number;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateCode() {
    this.invoice = this.generateNumericCode();
  }

  private generateNumericCode(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }
}
