import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';

export class GenericValidator {
  protected repository: Repository<any>;
  protected errorMessages = {};
  protected uniqueQueryConditions = {};
  protected uniqueQueryFilters = {};
  protected existenceCheck = {};
  protected condition: any;
  protected givenValues: any;
  protected givenUuid: string;

  protected validationMethods = {
    required: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const exists = this.fieldExists(field);
        const errorMessage = exists
          ? ''
          : message || `${field.replace('_', ' ')} is required.`;

        if (!exists) {
          reject(errorMessage);
        }
        resolve({ isValid: exists, message: errorMessage });
      });
    },

    requiredIf: async (
      field: string,
      conditions: string[],
      message: string,
    ) => {
      return new Promise((resolve, reject) => {
        const conditionCheck = conditions.slice(1);
        for (const condition of conditionCheck) {
          const checkField = condition.replace('!', '');
          const isConditionMet = condition.includes('!')
            ? !this.fieldExists(checkField)
            : this.fieldExists(checkField);
          const exists = isConditionMet ? this.fieldExists(field) : true;
          const errorMessage = exists
            ? ''
            : message || `${field.replace('_', ' ')} is required.`;

          if (!exists) {
            reject(errorMessage);
          }
        }
        resolve({ isValid: true, message: '' });
      });
    },

    length: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        if (!conditions[1]) {
          throw new HttpException(
            'Please provide a length limit.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const exceedsLength =
          this.fieldExists(field) && this.isString(this.givenValues[field])
            ? this.givenValues[field]?.length > conditions[1]
            : false;
        const errorMessage = exceedsLength
          ? message ||
            `${field.replace('_', ' ')} length must be under ${conditions[1]}.`
          : '';

        if (exceedsLength) {
          reject(errorMessage);
        }

        resolve({ isValid: !exceedsLength, message: errorMessage });
      });
    },

    minLength: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        if (!conditions[1]) {
          throw new HttpException(
            'Please provide a minimum length limit.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const belowMinLength =
          this.fieldExists(field) && this.isString(this.givenValues[field])
            ? this.givenValues[field]?.length < conditions[1]
            : false;
        const errorMessage = belowMinLength
          ? message ||
            `${field.replace('_', ' ')} minimum length must be ${conditions[1]}.`
          : '';

        if (belowMinLength) {
          reject(errorMessage);
        }

        resolve({ isValid: !belowMinLength, message: errorMessage });
      });
    },

    maxLength: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        if (!conditions[1]) {
          throw new HttpException(
            'Please provide a maximum length limit.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const exceedsMaxLength =
          this.fieldExists(field) && this.isString(this.givenValues[field])
            ? this.givenValues[field]?.length > conditions[1]
            : false;
        const errorMessage = exceedsMaxLength
          ? message ||
            `${field.replace('_', ' ')} maximum length should be less than ${conditions[1]}.`
          : '';

        if (exceedsMaxLength) {
          reject(errorMessage);
        }

        resolve({ isValid: !exceedsMaxLength, message: errorMessage });
      });
    },

    max: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        if (!conditions[1]) {
          throw new HttpException(
            'Please provide a maximum limit.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const exceedsMax =
          this.fieldExists(field) && this.isInt(this.givenValues[field])
            ? this.givenValues[field] > conditions[1]
            : false;
        const errorMessage = exceedsMax
          ? message || `Maximum ${field.replace('_', ' ')} is ${conditions[1]}.`
          : '';

        if (exceedsMax) {
          reject(errorMessage);
        }

        resolve({ isValid: !exceedsMax, message: errorMessage });
      });
    },

    min: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        if (!conditions[1]) {
          throw new HttpException(
            'Please provide a minimum limit.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const belowMin =
          this.fieldExists(field) && this.isInt(this.givenValues[field])
            ? this.givenValues[field] < conditions[1]
            : false;
        const errorMessage = belowMin
          ? message || `Minimum ${field.replace('_', ' ')} is ${conditions[1]}.`
          : '';

        if (belowMin) {
          reject(errorMessage);
        }

        resolve({ isValid: !belowMin, message: errorMessage });
      });
    },

    unique: async (field: string, conditions: string[], message: string) => {
      if (!conditions[1] && !this.uniqueQueryConditions[field]) {
        throw new HttpException(
          'Please provide a field or set a query condition.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return new Promise(async (resolve, reject) => {
        let query = {};
        if (conditions[1]) {
          query[conditions[1]] = this.fieldExists(field)
            ? this.givenValues[field]
            : '';
        }
        if (!conditions[1] && this.uniqueQueryConditions[field]) {
          query = { ...this.uniqueQueryConditions[field] };
        }

        const isFound = this.fieldExists(field)
          ? await this.repository.find({ where: query }).then((result: any) => {
              return !this.uniqueQueryFilters[field]
                ? result.length > 0
                : result.filter(this.uniqueQueryFilters[field]).length > 0;
            })
          : false;
        const errorMessage = isFound
          ? message || `${field.replace('_', ' ')} already exists.`
          : '';

        if (isFound) {
          reject(errorMessage);
        }

        resolve({ isValid: !isFound, message: errorMessage });
      });
    },

    number: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isNumber = this.fieldExists(field)
          ? this.isInt(this.givenValues[field])
          : true;
        const errorMessage = isNumber
          ? ''
          : message || `${field.replace('_', ' ')} must be a number.`;

        if (!isNumber) {
          reject(errorMessage);
        }
        resolve({ isValid: isNumber, message: errorMessage });
      });
    },

    integer: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isInteger = this.fieldExists(field)
          ? Number.isInteger(this.givenValues[field])
          : true;
        const errorMessage = isInteger
          ? ''
          : message || `${field.replace('_', ' ')} must be an integer.`;
    
        if (!isInteger) {
          reject(errorMessage);
        }
    
        resolve({ isValid: isInteger, message: errorMessage });
      });
    },    

    float: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isFloat = this.fieldExists(field)
          ? !isNaN(parseFloat(this.givenValues[field])) &&
            isFinite(this.givenValues[field])
          : true;

        const errorMessage = isFloat
          ? ''
          : message ||
            `${field.replace('_', ' ')} must be a valid floating-point number.`;

        if (!isFloat) {
          reject(errorMessage);
        }

        resolve({ isValid: isFloat, message: errorMessage });
      });
    },

    double: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isDouble = this.fieldExists(field)
          ? this.isDouble(this.givenValues[field])
          : true;
        const errorMessage = isDouble
          ? ''
          : message || `${field.replace('_', ' ')} must be a double.`;

        if (!isDouble) {
          reject(errorMessage);
        }

        resolve({ isValid: isDouble, message: errorMessage });
      });
    },

    enum: async (field: string, conditions: string[], message: any) => {
      return new Promise((resolve, reject) => {
        if (!message) {
          return reject(new HttpException('Enum values are missing', HttpStatus.BAD_REQUEST));
        }
    
        const isValid = message.includes(this.givenValues[field]);
    
        if (!isValid) {
          const errorMessage = message?.errorMessage
            ? message.errorMessage
            : `${field.replace('_', ' ')} must be one of the following values: ${message.join(', ')}`;
          
          return reject(new HttpException(errorMessage, HttpStatus.BAD_REQUEST));
        }
    
        resolve({
          valid: isValid,
          message: '',
        });
      });
    }, 

    array: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isArray = this.fieldExists(field) && Array.isArray(this.givenValues[field]);
        
        if (!isArray) {
          const errorMessage = message || `${field.replace('_', ' ')} must be an array`;
          return reject(errorMessage);
        }
    
        resolve({
          valid: true,
          message: '',
        });
      });
    },
       

    string: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isString = this.fieldExists(field)
          ? this.isString(this.givenValues[field])
          : true;
        const errorMessage = isString
          ? ''
          : message || `${field.replace('_', ' ')} must be a string.`;

        if (!isString) {
          reject(errorMessage);
        }
        resolve({ isValid: isString, message: errorMessage });
      });
    },

    stringArray: async (
      field: string,
      conditions: string[],
      message: string,
    ) => {
      return new Promise((resolve, reject) => {
        const fieldExists = this.fieldExists(field);
        const value = this.givenValues[field];

        const isStringArray = fieldExists
          ? Array.isArray(value) && value.every((item) => this.isString(item))
          : true;

        const errorMessage = isStringArray
          ? ''
          : message || `${field.replace('_', ' ')} must be an array of strings.`;

        if (!isStringArray) {
          reject(errorMessage);
        }

        resolve({ isValid: isStringArray, message: errorMessage });
      });
    },

    boolean: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isBoolean = this.fieldExists(field)
          ? this.isBoolean(this.givenValues[field])
          : true;
        const errorMessage = isBoolean
          ? ''
          : message || `${field.replace('_', ' ')} must be a boolean.`;

        if (!isBoolean) {
          reject(errorMessage);
        }
        resolve({ isValid: isBoolean, message: errorMessage });
      });
    },

    phone: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const phoneValue = this.givenValues[field];
        const isPhoneValid = this.fieldExists(field) && this.isString(phoneValue)
          ? this.isPhoneValid(phoneValue)
          : true;
        let errorMessage = '';
        if (!isPhoneValid) {
          errorMessage = message ? message : `Enter a valid ${field.replace('_', ' ')}`;
          return reject(errorMessage);
        }
    
        resolve({
          valid: isPhoneValid,
          message: errorMessage,
        });
      });
    },

    email: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isValidEmail = this.fieldExists(field)
          ? this.isEmailValid(this.givenValues[field])
          : true;
        const errorMessage = isValidEmail
          ? ''
          : message || `${field.replace('_', ' ')} must be a valid email.`;

        if (!isValidEmail) {
          reject(errorMessage);
        }

        resolve({ isValid: isValidEmail, message: errorMessage });
      });
    },

    uuid: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isUuidValid = this.fieldExists(field)
          ? this.isValidUUID(this.givenValues[field])
          : true;
        const errorMessage = isUuidValid
          ? ''
          : message || `${field.replace('_', ' ')} must be a valid UUID.`;

        if (!isUuidValid) {
          reject(errorMessage);
        }

        resolve({ isValid: isUuidValid, message: errorMessage });
      });
    },

    url: async (field: string, conditions: string[], message: string) => {
      return new Promise((resolve, reject) => {
        const isUrl = this.fieldExists(field)
          ? this.isUrl(this.givenValues[field])
          : true;
        const errorMessage = isUrl
          ? ''
          : message || `${field.replace('_', ' ')} must be a valid URL.`;

        if (!isUrl) {
          reject(errorMessage);
        }

        resolve({ isValid: isUrl, message: errorMessage });
      });
    },
  };

  protected fieldExists(field: string): boolean {
    return (
      this.givenValues.hasOwnProperty(field) &&
      this.givenValues[field] !== undefined &&
      this.givenValues[field] !== null
    );
  }

  protected isString(value: any): boolean {
    return typeof value === 'string';
  }

  protected isInt(value: any): boolean {
    return Number.isInteger(value);
  }

  protected isValidUUID(value: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(value);
  }

  protected isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  }

  protected isPhoneValid(phone: string): boolean {
    const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  }

  protected isEmailValid(value: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }

  protected isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch (_) {
      return false;
    }
  }

  protected isDouble(value: any): boolean {
    return typeof value === 'number' && value === +value && value % 1 !== 0;
  }

  async isUuidExist(fieldName: string | null = null, value: any, repository: any = null, key: string | null = null): Promise<boolean> {
    try {
      const givenRepository = repository ?? this.existenceCheck[fieldName];
  
      const query: Record<string, any> = {
        ...(key == null ? { unique_id: value } : {}),
        deleted: false,
      };
  
      if (key != null) {
        query[key] = value;
      }
  
      const exist = await givenRepository.findOneBy(query);
  
      return !!exist;
    } catch (error) {
      console.error(`Error checking if UUID exists: ${error.message}`);
      throw new Error('Error checking UUID existence');
    }
  }
  
  async increment(key: string) {
    try {
      const result = await this.repository.count();
      this.givenValues[key] = result + 1;
    } catch (error) {
      console.error(error);
    }
  }
  
  async addErrorMessage(field: string, message: string, allErrors: any) {
    allErrors[field] = allErrors[field] ? [...allErrors[field]] : [];
    allErrors[field] = [...allErrors[field], message];
    return allErrors;
  }
  
  async validateData() {
    return new Promise(async (resolve, reject) => {
      let errors = {};
      for (const field in this.condition) {
        const { list, message } = this.condition[field];
        if (list && message) {
          try {
            await this.singleFieldValidation(field, list, message);
          } catch (errorMessage) {
            errors = await this.addErrorMessage(field, errorMessage, errors);
          }
        }
      }
      if (Object.keys(errors).length > 0) {
        reject(errors);
      } else {
        resolve(await this.getValues());
      }
    });
  }
  
  async singleFieldValidation(field: string, list: string[], message: any) {
    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < list.length; i++) {
          if (typeof this.validationMethods[list[i]] === 'function') {
            await this.validationMethods[list[i]](field, [], message[list[i]]);
          } else {
            return reject(`Validation method ${list[i]} does not exist.`);
          }
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  
  async getValues() {
    return new Promise((resolve) => {
      const values = {};
      Object.keys(this.condition).forEach((key) => {
        if (this.givenValues[key]) {
          values[key] = this.givenValues[key];
        }
      });
      resolve(values);
    });
  }
  
  addNewValidationMethod(key: string, func: Function) {
    this.validationMethods[key] = func;
  }
  
  async validateRequestBody(value: any) {
    const totalItems = await this.repository.count();
    
    const hasLimit = !!value?.limit;
    const hasPage = !!value?.page;
  
    const limitErrorMessages = hasLimit ? [] : ['Please enter a limit in the "limit" field'];
    const pageErrorMessages = hasPage ? [] : ['Please enter a page number in the "page" field'];
  
    const errorMessages = {
      ...(pageErrorMessages.length > 0 ? { page: pageErrorMessages } : {}),
      ...(limitErrorMessages.length > 0 ? { limit: limitErrorMessages } : {}),
    };
  
    if (hasLimit && hasPage && value.page > Math.ceil(totalItems / value.limit)) {
      value.page = 1;
    }
  
    const validatedValue = value;
    return { errorMessages, validatedValue };
  }
  
}


// import { EntityManager, Repository } from "typeorm"
// import { HttpStatus } from '@nestjs/common/enums';
// import { HttpException } from '@nestjs/common/exceptions';

// export class RequestValidation {
//   private repository: any
//   private error_message: {}
//   private validation_condition: {}

//   constructor(repository: any) {
//     this.repository = repository
//   }

//   async validateRequestBody(value: any) {
//     let total_number_of_genericRepository = await this.repository.count(),
//       has_limit = value?.limit,
//       limit_error_message = [
//         ...(!has_limit ? ['please enter limit in "limit" field'] : [])
//       ],
//       has_page = value?.page,
//       page_error_message = [
//         ...(!has_page ? ['please enter page number in "page" field'] : [])
//       ],
//       error_message = {
//         ...(page_error_message.length > 0 ? { page: page_error_message } : {}),
//         ...(limit_error_message.length > 0 ? { limit: limit_error_message } : {}),
//       }
//     if (value.page && value.limit) {
//       if (value.page > Math.ceil(total_number_of_genericRepository / value.limit)) {
//         value.page = 1
//       }
//     }
//     return { error_message, value }
//   }
// }

// export class GenericValidator {
//   protected repository: any
//   protected error_messages = {}
//   protected unique_genericRepository_query = {}
//   protected unique_genericRepository_filer = {}
//   protected existence_check = {}
//   protected condition: any
//   protected givenValues: any
//   protected given_uuid: string

//   protected validation_method = {
//     required: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let has = this.exist(field),
//           error_message = ''
//         if (!has) {
//           error_message = message ? message : `${field.replace('_', ' ')} is required`
//           reject(error_message)
//         }
//         resolve({
//           valide: has,
//           message: error_message
//         })
//       })
//     },
//     required_if: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let new_check_if = check_if.splice(1, 1)
//         for (let check of new_check_if) {
//           let check_field = check.replace('!', ''),
//             condition = check.includes('!') ? !this.exist(check_field) : this.exist(check_field),
//             has = condition ? this.exist(field) : true,
//             error_message = ''

//           if (!has) {
//             error_message = message ? message : `${field.replace('_', ' ')} is required`
//             reject(error_message)
//           }
//         }
//         resolve({
//           valide: true,
//           message: 'error_message'
//         })
//       })
//     },
//     length: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {

//         if (!check_if[1])
//           throw new HttpException('provide length limit', HttpStatus.BAD_REQUEST);

//         let max_langth = this.exist(field) && this.isString(this.givenValues[field])
//           ? this.givenValues[field]?.length > check_if[1]
//           : false,
//           error_message = ''
//         if (max_langth) {
//           error_message = message ? message : `${field.replace('_', ' ')} length must be under ${check_if[1]}`
//           reject(error_message)
//         }

//         resolve({
//           valide: !max_langth,
//           message: error_message
//         })
//       })
//     },
//     min_length: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {

//         if (!check_if[1])
//           throw new HttpException('provide length limit', HttpStatus.BAD_REQUEST);

//         let max_langth = this.exist(field) && this.isString(this.givenValues[field])
//           ? this.givenValues[field]?.length < check_if[1]
//           : false,
//           error_message = ''
//         if (max_langth) {
//           error_message = message ? message : `${field.replace('_', ' ')} minimum length must be ${check_if[1]}`
//           reject(error_message)
//         }

//         resolve({
//           valide: !max_langth,
//           message: error_message
//         })
//       })
//     },
//     max: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {

//         if (!check_if[1])
//           throw new HttpException('provide max limit', HttpStatus.BAD_REQUEST);

//         let max = this.exist(field) && this.isInt(this.givenValues[field])
//           ? this.givenValues[field] > check_if[1]
//           : false,
//           error_message = ''
//         if (max) {
//           error_message = message ? message : `maximum ${field.replace('_', ' ')} is ${check_if[1]}`
//           reject(error_message)
//         }

//         resolve({
//           valide: !max,
//           message: error_message
//         })
//       })
//     },
//     min: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {

//         if (!check_if[1])
//           throw new HttpException('provide min limit', HttpStatus.BAD_REQUEST);

//         let min = this.exist(field) && this.isInt(this.givenValues[field])
//           ? this.givenValues[field] < check_if[1]
//           : false,
//           error_message = ''
//         if (min) {
//           error_message = message ? message : `minimum ${field.replace('_', ' ')} is ${check_if[1]}`
//           reject(error_message)
//         }

//         resolve({
//           valide: !min,
//           message: error_message
//         })
//       })
//     },
//     unique: async (field: string, check_if: string[], message: string) => {
//       if (!check_if[1] && !this.unique_genericRepository_query[field])
//         throw new HttpException('provide field or set query', HttpStatus.BAD_REQUEST);

//       return new Promise(async (resolve, reject) => {
//         let query = {}
//         if (check_if[1]) {
//           query[check_if[1]] = this.exist(field) ? this.givenValues[field] : ''
//         }
//         if (!check_if[1] && this.unique_genericRepository_query[field]) {
//           query = { ...this.unique_genericRepository_query[field] }
//         }

//         let found = this.exist(field)
//           ? await this.repository.find({ where: query }).then((result: any) => {
//             let is_found = !this.unique_genericRepository_filer[field] ? result.length > 0 : result.filter(this.unique_genericRepository_filer[field]).length > 0
//             return is_found
//           })
//           : false,
//           error_message = ''

//         if (found) {
//           error_message = message ? message : `${field.replace('_', ' ')} already exist`
//           reject(error_message)
//         }

//         resolve({
//           valide: !found,
//           message: error_message
//         })

//       })
//     },
//     number: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let isNumber = this.exist(field)
//           ? this.isInt(this.givenValues[field])
//           : true,
//           error_message = ''
//         if (!isNumber) {
//           error_message = message ? message : `${field.replace('_', ' ')} must be a number`
//           reject(error_message)
//         }
//         resolve({
//           valide: isNumber,
//           message: error_message
//         })
//       })
//     },

//     double: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let isDouble = this.exist(field)
//           ? this.isDouble(this.givenValues[field])
//           : true;
//         let error_message = '';

//         if (!isDouble) {
//           error_message = message ? message : `${field.replace('_', ' ')} must be a double`;
//           reject(error_message);
//         }

//         resolve({
//           valide: isDouble,
//           message: error_message
//         });
//       });
//     },

//     string: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let isString = this.exist(field)
//           ? this.isString(this.givenValues[field])
//           : true,
//           error_message = ''
//         if (!isString) {
//           error_message = message ? message : `${field.replace('_', ' ')} must be a string`
//           reject(error_message)
//         }
//         resolve({
//           valide: isString,
//           message: error_message
//         })
//       })
//     },
//     enum: async (field: string, check_if: string[], message: string) => {
//       if (!check_if[1])
//         throw new HttpException('provide enum values', HttpStatus.BAD_REQUEST);

//       return new Promise((resolve, reject) => {
//         let inEnum = this.exist(field)
//           ? check_if[1].split(',').includes(this.givenValues[field])
//           : true,
//           error_message = ''

//         if (!inEnum) {
//           error_message = message ? message : `${field.replace('_', ' ')} must in given formet`
//           reject(error_message)
//         }

//         resolve({
//           valide: inEnum,
//           message: error_message
//         })
//       })
//     },
//     array: async (field: string, check_if: string[], message: string) => {

//       return new Promise(async (resolve, reject) => {
//         let isArray = this.exist(field)
//           ? Array.isArray(this.givenValues[field])
//           : true,
//           error_message = '',
//           isValueType = true
//         if (Array.isArray(this.givenValues[field]) && this.exist(field)) {
//           for (const fieldValue of this.givenValues[field]) {
//             isValueType = this.exist(field) && check_if[1] && isArray
//               ? check_if[1] != 'uuid'
//                 ? !check_if[1].includes("search_by_") ? typeof fieldValue != check_if[1] : await this.isUuidExist(field, fieldValue, null, check_if[1].replace("search_by_", ''))
//                 : this.isUuid(fieldValue) && await this.isUuidExist(field, fieldValue)
//               : true

//             if (!isValueType) {
//               break
//             }
//           }
//         }

//         if (!isArray) {
//           error_message = message ? message : `${field.replace('_', ' ')} must be an array`
//           reject(error_message)
//         }

//         if (!isValueType) {
//           error_message = message ? message : `${field.replace('_', ' ')} must be an array of valid ${check_if[1].replace('search_by_', '')}`
//           reject(error_message)
//         }
//         resolve({
//           valide: isArray,
//           message: error_message
//         })
//       })
//     },
//     uuid: async (field: string, check_if: string[], message: string) => {

//       return new Promise(async (resolve, reject) => {

//         let isUuid = this.exist(field)
//           ? this.isUuid(this.givenValues[field])
//           : true,
//           exist = this.exist(field) && check_if[1] && isUuid
//             ? await this.isUuidExist(field, this.givenValues[field])
//             : true,
//           error_message = ''

//         if (!isUuid) {
//           error_message = message ? message : `${field.replace('_', ' ')} must be an unique user id`
//           reject(error_message)
//         }

//         if (!exist) {
//           error_message = message ? message : `invalide ${field.replace('_', ' ')}`
//           reject(error_message)
//         }
//         resolve({
//           valide: isUuid,
//           message: error_message
//         })
//       })
//     },
//     email: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let isEmail = this.exist(field) && this.isString(this.givenValues[field])
//           ? this.isEmailValide(this.givenValues[field])
//           : true,
//           error_message = ''
//         if (!isEmail) {
//           error_message = message ? message : `enter a valide ${field.replace('_', ' ')}`
//           reject(error_message)
//         }
//         resolve({
//           valide: isEmail,
//           message: error_message
//         })
//       })
//     },
//     phone: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let isPhone = this.exist(field) && this.isString(this.givenValues[field])
//           ? this.isPhoneValide(this.givenValues[field])
//           : true,
//           error_message = ''
//         if (!isPhone) {
//           error_message = message ? message : `enter a valide ${field.replace('_', ' ')}`
//           reject(error_message)
//         }
//         resolve({
//           valide: isPhone,
//           message: error_message
//         })
//       })
//     },

//     float: async (field: string, conditions: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         // Check if the field exists, then validate if it's a valid floating-point number
//         const isFloat = this.exist(field)
//           ? !isNaN(parseFloat(this.givenValues[field])) && isFinite(this.givenValues[field])
//           : true;

//         const errorMessage = isFloat
//           ? ''
//           : message || `${field.replace('_', ' ')} must be a valid floating-point number.`;

//         // Reject with error message if validation fails
//         if (!isFloat) {
//           reject(errorMessage);
//         }

//         // Resolve if validation is successful
//         resolve({ isValid: isFloat, message: errorMessage });
//       });
//     },

//     boolean: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let isboolean = this.exist(field)
//           ? typeof this.givenValues[field] == "boolean"
//           : true,
//           error_message = ''

//         if (!isboolean) {
//           error_message = message ? message : `${field.replace('_', ' ')} must be an boolean`
//           reject(error_message)
//         }
//         resolve({
//           valide: isboolean,
//           message: error_message
//         })
//       })
//     },
//     confirm: async (field: string, check_if: string[], message: string) => {
//       return new Promise((resolve, reject) => {
//         let confirmed = this.exist(field) && this.exist(check_if[1]) && check_if[1]
//           ? this.givenValues[check_if[1]] == this.givenValues[field]
//           : true,
//           error_message = ''

//         if (this.exist(field) && !this.exist(check_if[1])) {
//           error_message = message ?? `${check_if[1]} is required`
//           reject(error_message)
//         }

//         if (!confirmed) {
//           error_message = message ?? `${field.replace('_', ' ')} is not matched with ${check_if[1]}`
//           reject(error_message)
//         }
//         resolve({
//           valide: confirmed,
//           message: error_message
//         })
//       })
//     },
//     previous_password: async (field: string, check_if: string[], message: string) => {
//       return new Promise(async (resolve, reject) => {
//         let user = await this.repository.findOneBy({ unique_id: this.givenValues.user_info.unique_id }),
//           // valid_password = bcrypt.compare(this.givenValues[field],user.password),
//           valid_password = true,
//           error_message = ''

//         if (this.exist(field) && !valid_password) {
//           error_message = message ?? `${field.replace('_', ' ')} not matched`
//           reject(error_message)
//         }

//         resolve({
//           valide: valid_password,
//           message: error_message
//         })
//       })
//     }
//   }

//   isInt(value: any) {
//     return !isNaN(value) && (function (x) { return (x | 0) === x; })(parseFloat(value))
//   }

//   isDouble(value: any) {
//     return !isNaN(value) && parseFloat(value) == value;
//   }

//   isUuid(value: any) {
//     const uuid_regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
//     return value.match(uuid_regexExp)
//   }

//   async isUuidExist(fieldName: any = null, value: any, repository: any = null, key: string = null) {
//     const given_repository = repository ?? this.existence_check[fieldName],
//       query = {
//         ...(key == null ? { unique_id: value } : {}),
//         deleted: false
//       }
//     if (key != null) {
//       query[key] = value
//     }

//     const exist = await given_repository.findOneBy(query)
//     return exist
//   }

//   isString(value: any) {
//     return typeof value == 'string' && value.length > 0
//   }

//   isObject(value: any) {
//     return typeof value === 'object'
//   }

//   areArraysMatched(arr1: any, arr2: any) {

//     // Check if the arrays have the same length
//     if (arr1.length !== arr2.length) {
//       return false;
//     }

//     // Compare each element of the arrays
//     for (let i = 0; i < arr1.length; i++) {
//       if (arr1[i] !== arr2[i]) {
//         return false;
//       }
//     }

//     // If we haven't returned false by this point, the arrays are matched
//     return true;
//   }

//   async isSchemaMatched(field_name: string, object: Object, schema: object, repository: any = {}) {

//     const condition_check = {
//       number: this.isInt,
//       uuid: this.isUuid,
//       string: this.isString,
//     }

//     const is_schema_matched = this.areArraysMatched(Object.keys(object), Object.keys(schema))
//     if (!is_schema_matched) {
//       return {
//         'matched': false,
//         'message': `${field_name} value must be array of object with value of ${String(Object.keys(schema))}`
//       }
//     }

//     if (is_schema_matched) {
//       for (const index in object) {

//         let value = object[index],
//           check_if = schema[index],
//           valid = condition_check[check_if](value)
//         if (!valid) {
//           return {
//             'matched': false,
//             'field': index,
//             'message': `${index} must be ${check_if}`
//           }
//         }

//         if (check_if == 'uuid') {
//           let exist = await this.isUuidExist(null, value, repository[index])
//           if (!exist) {
//             return {
//               'matched': false,
//               'field': index,
//               'message': `${index} not found`
//             }
//           }
//         }

//       }

//       return {
//         'matched': true,
//         'message': ''
//       }

//     }

//   }

//   exist(field: string) {
//     let has = this.isInt(this.givenValues[field])
//       ? this.givenValues[field] > 0
//       : this.givenValues[field] ? this.givenValues[field].length > 0 : false
//     return has
//   }

//   isEmailValide(email: string): boolean {
//     let email_ragex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
//       is_valide_email = email.match(email_ragex)
//     return is_valide_email ? true : false
//   }
//   isPhoneValide(phone: string): boolean {
//     let phone_ragex =/^(?:\+?88)?01[3-9]\d{8}$/,
//       is_valide_phone = phone.match(phone_ragex)
//     return is_valide_phone ? true : false
//   }

//   async increament(key: string) {
//     await this.repository.count().then((result: any) => {
//       this.givenValues[key] = result + 1
//     }).catch((result: any) => { console.log(result) })
//   }

//   addErrorMessage(field: string, message: string, all_error: any) {
//     all_error[field] = all_error[field] ? [...all_error[field]] : []
//     all_error[field] = [
//       ...all_error[field],
//       message
//     ]
//     return all_error
//   }

//   async validateData() {
//     return new Promise(async (resolve, reject) => {
//       let error = {}
//       for (const key in this.condition) {
//         let list = this.condition[key].list,
//           message = this.condition[key].message
//         if (list && message) {
//           let field = key
//           await this.singleFieldValidation(field, list, message)
//             .then((response: any) => { }).catch((error_message) => {
//               error[field] = error_message
//             })
//         }
//       }
//       if (Object.keys(error).length > 0) reject(error)
//       resolve(await this.getValues().then(response => response))

//     })
//   }

//   // async singleFieldValidation(field: string, list: string[], message: any) {
//   //   return new Promise(async (resolve, reject) => {
//   //     let error_message = []
//   //     for (let i = 0; i < list.length; i++) {
//   //       let check_if = list[i].split(',')
//   //       await this.validation_method[check_if[0]](field, check_if, message[check_if[0]])
//   //         .then((response: any) => response)
//   //         .catch((error: any) => { error_message.push(error) })
//   //     }
//   //     if (error_message.length > 0) reject(error_message)
//   //     resolve(true)
//   //   })
//   // }

//   async singleFieldValidation(field: string, check_if: string[], message: any) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         // Check if the method exists
//         if (typeof this.validation_method[check_if[0]] === 'function') {
//           // Call the validation method
//           await this.validation_method[check_if[0]](field, check_if, message[check_if[0]]);
//           resolve(true);
//         } else {
//           console.error(`Validation method ${check_if[0]} does not exist.`);
//           reject(`Validation method ${check_if[0]} does not exist.`);
//         }
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }

//   getValues() {
//     return new Promise((resolve, reject) => {
//       let values = {}
//       Object.keys(this.condition).map((key, index) => {
//         if (this.givenValues[key])
//           values[key] = this.givenValues[key]
//       })
//       resolve(values);
//     })
//   }

//   addNewValidationMethod(key: string, func: Function) {
//     // console.log(this.validation_method);
//     this.validation_method[key] = func
//   }

//   async validateRequestBody(value: any) {
//     let total_number_of_genericRepository = await this.repository.count(),
//       has_limit = value?.limit,
//       limit_error_message = [
//         ...(!has_limit ? ['please enter limit in "limit" field'] : [])
//       ],
//       has_page = value?.page,
//       page_error_message = [
//         ...(!has_page ? ['please enter page number in "page" field'] : [])
//       ],
//       errorMessages = {
//         ...(page_error_message.length > 0 ? { page: page_error_message } : {}),
//         ...(limit_error_message.length > 0 ? { limit: limit_error_message } : {}),
//       }
//     if (value.page && value.limit) {
//       if (value.page > Math.ceil(total_number_of_genericRepository / value.limit)) {
//         value.page = 1
//       }
//     }
//     let validatedValue = value;
//     return { errorMessages, validatedValue }
//   }

// }

// export function is_email_valid(email: string): boolean {
//   let email_ragex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
//     is_valid_email = email.match(email_ragex)
//   return is_valid_email ? true : false
// }
