import { Exclude, Expose } from 'class-transformer';
import { Demo } from './entities/demo.entity';

export class DemoDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<DemoDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class DemoListSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<DemoListSerializer>) {
    Object.assign(this, partial);
  }
}

export class AdminDemoDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AdminDemoDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class AdminDemoListSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AdminDemoListSerializer>) {
    Object.assign(this, partial);
  }
}

export class VendorDemoDetailSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<VendorDemoDetailSerializer>) {
    Object.assign(this, partial);
  }
}

export class VendorDemoListSerializer {
  @Expose()
  @Exclude()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  isArchived: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<VendorDemoListSerializer>) {
    Object.assign(this, partial);
  }
}
