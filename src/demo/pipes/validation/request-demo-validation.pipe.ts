import {
    Injectable,
    PipeTransform,
    ArgumentMetadata,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { GenericValidator } from 'src/common/utils/generic-validator';
  import { Demo } from 'src/demo/entities/demo.entity';
  import { Repository } from 'typeorm';
  
  @Injectable()
  export class RequestDemoValidationPipe
    extends GenericValidator
    implements PipeTransform
  {
    constructor(
      @InjectRepository(Demo)
      private readonly demoRepository: Repository<Demo>,
    ) {
      super();
      this.repository = demoRepository;
    }
  
    async transform(value: any, metadata: ArgumentMetadata) {
      const { errorMessages, validatedValue } = await this.validateRequestBody(value);
  
      if (Object.keys(errorMessages).length > 0) {
        throw new HttpException(errorMessages, HttpStatus.BAD_REQUEST);
      }
  
      return validatedValue;
    }
  }
  