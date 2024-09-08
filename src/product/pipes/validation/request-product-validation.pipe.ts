import {
    Injectable,
    PipeTransform,
    ArgumentMetadata,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { GenericValidator } from 'src/common/utils/generic-validator';
  import { Product } from 'src/product/entities/product.entity';
  import { Repository } from 'typeorm';
  
  @Injectable()
  export class RequestProductValidationPipe
    extends GenericValidator
    implements PipeTransform
  {
    constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
    ) {
      super();
      this.repository = productRepository;
    }
  
    async transform(value: any, metadata: ArgumentMetadata) {
      const { errorMessages, validatedValue } = await this.validateRequestBody(value);
  
      if (Object.keys(errorMessages).length > 0) {
        throw new HttpException(errorMessages, HttpStatus.BAD_REQUEST);
      }
  
      return validatedValue;
    }
  }
  