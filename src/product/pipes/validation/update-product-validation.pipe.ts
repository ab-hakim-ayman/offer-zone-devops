import { Injectable, PipeTransform, ArgumentMetadata, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Validator } from "class-validator";
import { Category } from "src/common/enums/category.enum";
import { GenericValidator } from "src/common/utils/generic-validator";
import { Product } from "src/product/entities/product.entity";
import { Repository } from "typeorm";

  
  @Injectable()
  export class UpdateProductValidationPipe extends GenericValidator implements PipeTransform {
    constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
    ) {
      super();
      this.repository = productRepository;
      this.condition = {
        title: {
          list: ['string'],
          message: {
            string: 'The product name must be a string.',
          },
        },
        description: {
          list: ['string'],
          message: {
            string: 'The Product description must be a string.',
          },
        },
        category: {
          list: ['enum'],
          message: {
            enum: Object.values(Category)
          }
        },
        price: {
          list: ['float'],
          message: {
            float: 'The product purchasePrice must be a float number'
          },
        },
        stockQuantity: {
          list: ['integer'],
          message: {
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
        }
      };
    }
  
    async transform(value: any, metadata: ArgumentMetadata) {
      if (value.category === undefined) {
        delete this.condition['category'];
      }

      if (value.isPublished !== undefined) {
        value.isPublished = value.isPublished === 'true' || value.isPublished === true;
      }
      if (value.isFeatured !== undefined) {
        value.isFeatured = value.isFeatured === 'true' || value.isFeatured === true;
      }

      this.givenValues = value;
  
      try {
        const validatedData = await this.validateData()
        .then( (response: any) => response )
  
        return validatedData;
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Product update validation failed',
            errors: error,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
  