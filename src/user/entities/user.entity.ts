import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn } from 'typeorm';

import { Roles } from 'src/common/enums/roles.enum';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'text', nullable: true })
  name: string;
  
  @Column({ type: 'text', nullable: false, unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.User,
  })
  role: Roles;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  emailVerificationTokenExpiry?: Date;

  
  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  phoneVerificationToken?: string;

  @Column({ nullable: true })
  phoneVerificationTokenExpiry?: Date;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: true })
  resetTokenExpiry?: Date;

  @Column()
  isArchived: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
