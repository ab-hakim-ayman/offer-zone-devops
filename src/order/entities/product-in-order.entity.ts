import { IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
import { ObjectId } from "typeorm";

export class ProductInOrder {
    @IsNotEmpty()
    _id: ObjectId;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsNumber()
    purchasePrice: number;

    @IsNotEmpty()
    @IsNumber()
    sellPrice: number;

    @IsNotEmpty()
    @IsNumber()
    stockQuantity: number;
    
    @IsNotEmpty()
    @IsNumber()
    cartQuantity: number;
}
