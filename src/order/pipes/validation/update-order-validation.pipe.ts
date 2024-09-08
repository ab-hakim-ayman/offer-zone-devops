import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { GenericValidator } from 'src/common/utils/generic-validator';
import { Order } from 'src/order/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UpdateOrderValidationPipe
  extends GenericValidator
  implements PipeTransform
{
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    super();
    this.repository = orderRepository;
    this.condition = {
      name: {
        list: ['string'],
        message: {
          string: 'The order name must be a string.',
        },
      },
      email: {
        list: ['email'],
        message: {
          required: 'The order email is required.',
          email: 'The Order email must be a valid email.',
        },
      },
      phone: {
        list: ['phone'],
        message: {
          phone: 'The Order phone must be a valid phone number.',
        },
      },
      address: {
        list: ['string'],
        message: {
          string: 'The order address must string',
        }
      },
      status: {
        list: ['enum'],
        message: {
          enum: Object.values(OrderStatus)
        }
      }
      
    }
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    this.givenValues = value;

    try {
      const validatedData = await this.validateData().then(
        (response: any) => response,
      );

      return validatedData;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Order validation failed',
          errors: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
