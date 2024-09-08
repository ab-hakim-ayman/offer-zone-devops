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
export class CreateOrderValidationPipe
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
        list: ['required', 'string'],
        message: {
          required: 'The order name is required.',
          string: 'The order name must be a string.',
        },
      },
      email: {
        list: ['required', 'email'],
        message: {
          required: 'The order email is required.',
          email: 'The Order email must be a valid email.',
        },
      },
      phone: {
        list: ['required', 'phone'],
        message: {
          required: 'The order phone is required.',
          phone: 'The Order phone must be a valid phone number.',
        },
      },
      address: {
        list: ['required', 'string'],
        message: {
          required: 'The order address is required.',
          string: 'The order address must string',
        }
      },
      products: {
        list: ['required', 'array'],
        message: {
          required: 'The order products is required.',
          array: 'The order products must be an array'
        }
      },
      price: {
        list: ['float'],
        message: {
          float: 'The price must be a float number'
        }
      },
      profit: {
        list: ['float'],
        message: {
          float: 'The price must be a float number'
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

      if (!validatedData.status) {
        validatedData.status = OrderStatus.InCart;
      }


      if (!validatedData.isArchived) {
        validatedData.isArchived = false;
      }

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
