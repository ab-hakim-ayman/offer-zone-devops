import {
    Injectable,
    PipeTransform,
    ArgumentMetadata,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { GenericValidator } from 'src/common/utils/generic-validator';
  import { User } from 'src/user/entities/user.entity';
  import { Repository } from 'typeorm';
  
  @Injectable()
  export class SignVaInlidationPipe
    extends GenericValidator
    implements PipeTransform
  {
    constructor(
      @InjectRepository(User) private userRepository: Repository<User>,
    ) {
      super();
      this.repository = userRepository;
      this.condition = {
        email: {
          list: ['required', 'email', 'unique'],
          message: {
            required: 'Email is required',
            email: 'Given data is not valid email',
            unique: 'Email should be unique',
          },
        },
        password: {
          list: ['required', 'string'],
          message: { required: 'Password is required' },
        },
      };
    }
  
    async transform(value: any, metadata: ArgumentMetadata) {
      console.log(value);
      this.givenValues = value;
  
      let validatedData = await this.validateData()
        .then((response: any) => response)
        .catch((error: any) => {
          throw new HttpException(error, HttpStatus.BAD_REQUEST);
        });
  
      return validatedData;
    }
  }
  