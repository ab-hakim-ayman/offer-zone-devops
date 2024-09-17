import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { ObjectId } from "typeorm";

export class ProductInOrder {
    @IsNotEmpty()
    _id: ObjectId;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    vendorEmail?: string;

    @IsOptional()
    @IsString()
    vendorPhone?: string;
    
    @IsNotEmpty()
    @IsNumber()
    cartQuantity: number;
}
