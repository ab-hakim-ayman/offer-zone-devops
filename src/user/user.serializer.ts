import { Exclude } from "class-transformer";

export class UserDetailSerializer {
    @Exclude() 
    _id: number;
  
    @Exclude() 
    createdAt: Date;
  
    @Exclude() 
    updatedAt: Date;
  
    constructor(partial: Partial<UserDetailSerializer>) {
      Object.assign(this, partial);
    }
  }

export class UserListSerializer {
    @Exclude() 
    _id: number;
  
    @Exclude() 
    createdAt: Date;
  
    @Exclude() 
    updatedAt: Date;
  
    constructor(partial: Partial<UserListSerializer[]>) {
      Object.assign(this, partial);
    }
  }


  export class AdminUserDetailSerializer {
    @Exclude() 
    _id: number;
  
    @Exclude() 
    createdAt: Date;
  
    @Exclude() 
    updatedAt: Date;
  
    constructor(partial: Partial<AdminUserDetailSerializer>) {
      Object.assign(this, partial);
    }
  }

export class AdminUserListSerializer {
    @Exclude() 
    _id: number;
  
    @Exclude() 
    createdAt: Date;
  
    @Exclude() 
    updatedAt: Date;
  
    constructor(partial: Partial<AdminUserListSerializer[]>) {
      Object.assign(this, partial);
    }
  }


  export class VendorUserDetailSerializer {
    @Exclude() 
    _id: number;
  
    @Exclude() 
    createdAt: Date;
  
    @Exclude() 
    updatedAt: Date;
  
    constructor(partial: Partial<VendorUserDetailSerializer>) {
      Object.assign(this, partial);
    }
  }

export class VendorUserListSerializer {
    @Exclude() 
    _id: number;
  
    @Exclude() 
    createdAt: Date;
  
    @Exclude() 
    updatedAt: Date;
  
    constructor(partial: Partial<VendorUserListSerializer[]>) {
      Object.assign(this, partial);
    }
  }