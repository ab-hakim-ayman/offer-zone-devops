import {
    Injectable,
    PipeTransform,
    ArgumentMetadata,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { GenericValidator } from 'src/common/utils/generic-validator';
import { Order } from 'src/order/entities/order.entity';
  import { Repository } from 'typeorm';
  
  @Injectable()
  export class RequestOrderValidationPipe
    extends GenericValidator
    implements PipeTransform
  {
    constructor(
      @InjectRepository(Order)
      private readonly orderRepository: Repository<Order>,
    ) {
      super();
      this.repository = orderRepository;
    }
  
    async transform(value: any, metadata: ArgumentMetadata) {
      const { errorMessages, validatedValue } = await this.validateRequestBody(value);
  
      if (Object.keys(errorMessages).length > 0) {
        throw new HttpException(errorMessages, HttpStatus.BAD_REQUEST);
      }
  
      return validatedValue;
    }
  }
  