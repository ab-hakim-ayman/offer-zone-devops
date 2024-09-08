import { Injectable, PipeTransform, ArgumentMetadata, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Validator } from "class-validator";
import { GenericValidator } from "src/common/utils/generic-validator";
import { Demo } from "src/demo/entities/demo.entity";
import { Repository } from "typeorm";

  
  @Injectable()
  export class CreateDemoValidationPipe extends GenericValidator implements PipeTransform {
    constructor(
      @InjectRepository(Demo)
      private readonly demoRepository: Repository<Demo>,
    ) {
      super();
      this.repository = demoRepository;
      this.condition = {
        name: {
          list: ['required', 'string'],
          message: {
            required: 'The demo name is required.',
            string: 'The demo name must be a string.',
          },
        },
        description: {
          list: ['required', 'string'],
          message: {
            required: 'The demo description is required.',
            string: 'The Demo description must be a string.',
          },
        },
        isArchived: {
          list: ['boolean'],
          message: {
            boolean: 'The Demo isArchived must be a boolean.',
          }
        }
      };
    }
  
    async transform(value: any, metadata: ArgumentMetadata) {
      this.givenValues = value;
  
      try {
        const validatedData = await this.validateData()
        .then( (response: any) => response )
  
        if (!validatedData.isArchived) {
          validatedData.isArchived = false;
        }
  
        return validatedData;
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Validation failed',
            errors: error,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
  