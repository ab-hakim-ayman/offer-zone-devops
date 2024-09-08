import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenericValidator } from 'src/common/utils/generic-validator';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class SignUpValidationPipe extends GenericValidator implements PipeTransform {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
    super()
    this.repository = userRepository
    this.condition = {
      name: { list: ['string'], message: {} },
      email: { list: ['required', 'email'], message: {} },
      phone: { list: ['phone'], message: {} },
      role: { list: ['string'], message: {} },
      address: { list: ['string'], message: {} },
      password: { list: ['required', 'string'], message: {} },
      resetToken: { list: ['string'], message: {} },
      resetTokenExpiry: { list: ['string'], message: {} },
      isArchived: { list: ['boolean'], message: {} },
      isEmailVerified: { list: ['boolean'], message: {} },
      isPhoneVerified: { list: ['boolean'], message: {} },
    }
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    this.givenValues = value;

    let validatedData = await this.validateData()
      .then((response: any) => response)
      .catch((error: any) => { throw new HttpException(error, HttpStatus.BAD_REQUEST) })

    if(!validatedData.isArchived) {
      validatedData.isArchived = false;
    }

    if(!validatedData.isEmailVerified) {
      validatedData.isEmailVerified = false;
    }

    if(!validatedData.isPhoneVerified) {
      validatedData.isPhoneVerified = false;
    }

    return validatedData;
  }
}


