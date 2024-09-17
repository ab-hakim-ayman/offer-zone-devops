import { Injectable, PipeTransform, ArgumentMetadata, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { trusted } from "mongoose";
import { GenericValidator } from "src/common/utils/generic-validator";
import { Product } from "src/product/entities/product.entity";
import { Repository } from "typeorm";

  
  @Injectable()
  export class CreateProductValidationPipe extends GenericValidator implements PipeTransform {
    constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
    ) {
      super();
      this.repository = productRepository;
      this.condition = {
        title: {
          list: ['required', 'string'],
          message: {
            required: 'The product name is required.',
            string: 'The product name must be a string.',
          },
        },
        description: {
          list: ['required', 'string'],
          message: {
            required: 'The product description is required.',
            string: 'The Product description must be a string.',
          },
        },
        price: {
          list: ['required', 'float'],
          message: {
            required: 'The product price is required',
            number: 'The product price must be a number number'
          },
        },
        stockQuantity: {
          list: ['required', 'integer'],
          message: {
            required: 'The product stockQuantity is required',
            integer: 'The product stockQuantity must be an integer'
          },
        },
        tags: {
          list: ['stringArray'],
          message: {
            stringArray: 'The product tags must be an array of strings'
          },
        },
        images: {
          list: ['stringArray'],
          message: {
            required: 'The product images is required',
            stringArray: 'The product images must be an array of strings'
          },
        },
        isFeatured: {
          list: ['boolean'],
          message: {
            boolean: 'The Product isFeatured must be a boolean.',
          }
        },
        isPublished: {
          list: ['boolean'],
          message: {
            boolean: 'The Product isPublished must be a boolean.',
          }
        },
        isArchived: {
          list: ['boolean'],
          message: {
            boolean: 'The Product isArchived must be a boolean.',
          }
        }
      };
    }
  
    async transform(value: any, metadata: ArgumentMetadata) {
      this.givenValues = value;
  
      try {
        const validatedData = await this.validateData()
        .then( (response: any) => response )
  
        if (!validatedData.isFeatured) {
          validatedData.isFeatured = false;
        }

        if (!validatedData.isPublished) {
          validatedData.isPublished = true;
        }

        if (!validatedData.isArchived) {
          validatedData.isArchived = false;
        }
  
        return validatedData;
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Product create validation failed',
            errors: error,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
  