import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { join } from 'path';
import { promises as fs } from 'fs';
import { calculateDateRange } from './generic-date';
import { FindOneOptions, QueryFailedError } from 'typeorm';


export class GenericRepository {
  private readonly repository: any;
  private readonly detailSerializer: any;
  private readonly listSerializer: any;
  private readonly adminDetailSerializer: any;
  private readonly adminListSerializer: any;
  private readonly vendorDetailSerializer: any;
  private readonly vendorListSerializer: any;

  constructor(
    repository: any,
    detailSerializer: any,
    listSerializer: any,
    adminDetailSerializer: any,
    adminListSerializer: any,
    vendorDetailSerializer: any,
    vendorListSerializer: any,
  ) {
    this.repository = repository;
    this.detailSerializer = detailSerializer;
    this.listSerializer = listSerializer;
    this.adminDetailSerializer = adminDetailSerializer;
    this.adminListSerializer = adminListSerializer;
    this.vendorDetailSerializer = vendorDetailSerializer;
    this.vendorListSerializer = vendorListSerializer;
  }

  async create(data: object, collection: string): Promise<any> {
    const serializedData = new this.detailSerializer(data);
    console.log(serializedData);

    try {
      const record = this.repository.create(serializedData);
      await this.repository.save(record);

      return {
        data: record,
        message: `${collection} successfully created`,
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      this.handleDatabaseError(error, `Failed to create the ${collection}`);
    }
  }

  async findOne(id: object, collection: string): Promise<any> {
    try {
      const record = await this.repository.findOne({
        where: id,
        loadRelationIds: true,
      });

      if (!record) {
        throw new NotFoundException(`${collection} not found`);
      }

      return {
        data: record,
        message: `${collection} found`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      this.handleDatabaseError(error, `Error finding ${collection}`);
    }
  }

  async update(
    _id: object,
    data: object,
    collection: string,
  ): Promise<any> {
    try {
      const record = await this.repository.findOne({
        where: _id,
        loadRelationIds: true,
      });
  
      if (!record) {
        throw new NotFoundException(`${collection} not found`);
      }
  
      const dataWithImages = data as { images?: string[] };
  
      if (dataWithImages.images && dataWithImages.images.length > 0) {
        const oldImages = record.images || [];
  
        const imagesToDelete = oldImages.filter(
          (oldImage: string) => !dataWithImages.images.includes(oldImage),
        );
  
        for (const image of imagesToDelete) {
          const oldImagePath = join(
            __dirname,
            '..',
            '..',
            '..',
            'public',
            'images',
            'products',
            image
          );
          await fs.unlink(oldImagePath).catch((unlinkError) => {
            console.error(`Failed to delete old image file: ${image}`, unlinkError);
          });
        }
  
        record.images = dataWithImages.images;
      }
  
      Object.assign(record, data);
  
      await this.repository.save(record);
  
      return {
        data: record,
        message: `${collection} successfully updated`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      this.handleDatabaseError(error, `Error updating ${collection}`);
    }
  }

  async delete(id: object, collection: string): Promise<any> {
    try {
      const record = await this.repository.findOne({
        where: id,
        loadRelationIds: true,
      });
  
      if (!record) {
        throw new NotFoundException(`${collection} not found`);
      }
  
      if (!record.isArchived) {
        throw new BadRequestException(
          `${collection} is not archived and cannot be deleted`,
        );
      }
  
      if (record.images && record.images.length > 0) {
        for (const image of record.images) {
          const imagePath = join(
            __dirname,
            '..',
            '..',
            '..',
            'public',
            'images',
            'products',
            image,
          );
          await fs.unlink(imagePath).catch((unlinkError) => {
            console.error(`Failed to delete image file: ${image}`, unlinkError);
          });
        }
      }
  
      await this.repository.delete(id);
  
      return {
        message: `${collection} successfully deleted`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      this.handleDatabaseError(error, `Error deleting ${collection}`);
    }
  }

  async deleteAll(collection: string): Promise<any> {
    try {
      const records = await this.repository.find({
        loadRelationIds: true,
      });
  
      for (const record of records) {
        if (record.images && record.images.length > 0) {
          for (const image of record.images) {
            const imagePath = join(
              __dirname,
              '..',
              '..',
              'public',
              'images',
              'products',
              image,
            );
            await fs.unlink(imagePath).catch((unlinkError) => {
              console.error(`Failed to delete image file: ${image}`, unlinkError);
            });
          }
        }
      }
  
      await this.repository.clear();
  
      return {
        message: `All ${collection.toLowerCase()} successfully deleted`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting all ${collection.toLowerCase()}`,
      );
    }
  }

  async archive(id: object, collection: string): Promise<any> {
    try {
      const record = await this.repository.findOne({
        where: id,
        loadRelationIds: true,
      });

      if (!record) {
        throw new NotFoundException(`${collection} not found`);
      }

      record.isArchived = true;
      await this.repository.save(record);

      return {
        data: record,
        message: `${collection} successfully archived`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      this.handleDatabaseError(error, `Error archiving ${collection}`);
    }
  }

  async restore(id: object, collection: string): Promise<any> {
    try {
      const record = await this.repository.findOne({
        where: id,
        loadRelationIds: true,
      });

      if (!record) {
        throw new NotFoundException(`${collection} not found`);
      }

      if (!record.isArchived) {
        throw new BadRequestException(`${collection} is not archived`);
      }

      record.isArchived = false;
      await this.repository.save(record);

      return {
        data: record,
        message: `${collection} successfully restored`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      this.handleDatabaseError(error, `Error restoring ${collection}`);
    }
  }

  async findArchive(collection: string) {
    try {
      const records = await this.repository.find({
        where: {
          isArchived: true,
        },
      });

      if (records.length === 0) {
        throw new NotFoundException(`No archived ${collection.toLowerCase()} found`);
      }

      return {
        data: records,
        message: `Archived ${collection.toLowerCase()} records found`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`An error occurred while fetching archived ${collection.toLowerCase()}`);
    }
  }

  // async findAll(dto: any, collection: string): Promise<any> {
  //   try {
  //     const query = dto.query || {};
  //     const regexQuery: any = {};
  //     let dateQuery: any = {};
  //     let isArchived: boolean = dto?.isArchived;
  
  //     if (!dto.page || !dto.limit) {
  //       throw new BadRequestException('Pagination parameters (page and limit) are required.');
  //     }
  
  //     if (query.dateRange) {
  //       const [start, end] = query.dateRange.split('|').map((date: string) => new Date(date));
  //       dateQuery = { createdAt: { $gte: start, $lte: end } };
  //     } else if (query.start && query.end) {
  //       dateQuery = {
  //         createdAt: { $gte: new Date(query.start), $lte: new Date(query.end) },
  //       };
  //     }
  
  //     for (const key in query) {
  //       if (query.hasOwnProperty(key) && !['dateRange', 'start', 'end', 'order'].includes(key)) {
  //         regexQuery[key] = { $regex: new RegExp(query[key], 'i') };
  //       }
  //     }
  
  //     const order = query.order ? { createdAt: query.order.toUpperCase() } : { createdAt: 'DESC' };
  
  //     const finalQuery = {
  //       ...regexQuery,
  //       ...dateQuery,
  //       isArchived
  //     };
  //     console.log(finalQuery);
    
  //     const [data, total] = await this.repository.findAndCount({
  //       where: finalQuery,
  //       skip: (dto.page - 1) * dto.limit,
  //       take: dto.limit,
  //       order: order,
  //     });
    
  //     if (total === 0) {
  //       throw new NotFoundException(`No ${collection.toLowerCase()} found matching the query.`);
  //     }
  
  //     return {
  //       data,
  //       totalObject: total,
  //       pageSize: dto.limit,
  //       currentPage: dto.page,
  //       totalPage: Math.ceil(total / dto.limit),
  //       message: `${collection}s successfully found.`,
  //       status: HttpStatus.OK,
  //     };
  
  //   } catch (error) {
  
  //     if (error instanceof NotFoundException || error instanceof BadRequestException) {
  //       throw error; 
  //     }
  
  //     throw new InternalServerErrorException({
  //       message: `Could not fetch ${collection.toLowerCase()}.`
  //     });
  //   }
  // }


  async findAll(dto: any, collection: string): Promise<any> {
    try {
        const query = dto.query || {};
        const regexQuery: any = {};
        let dateQuery: any = {};
        let isArchived: boolean = dto?.isArchived || false;
  
        if (!dto.page || !dto.limit) {
            throw new BadRequestException('Pagination parameters (page and limit) are required.');
        }
  
        if (query.dateRange) {
            const [start, end] = query.dateRange.split('|').map((date: string) => new Date(date));
            dateQuery = { createdAt: { $gte: start, $lte: end } };
        } else if (query.start && query.end) {
            dateQuery = {
                createdAt: { $gte: new Date(query.start), $lte: new Date(query.end) },
            };
        }
  
        for (const key in query) {
            if (query.hasOwnProperty(key) && !['dateRange', 'start', 'end', 'order'].includes(key)) {
                regexQuery[key] = { $regex: new RegExp(query[key], 'i') };
            }
        }
  
        const order = query.order ? { createdAt: query.order.toUpperCase() } : { createdAt: 'DESC' };
  
        const finalQuery = {
            ...regexQuery,
            ...dateQuery,
            isArchived
        };
    
        const [data, total] = await this.repository.findAndCount({
            where: finalQuery,
            skip: (dto.page - 1) * dto.limit,
            take: dto.limit,
            order: order,
        });
    
        if (total === 0) {
            throw new NotFoundException(`No ${collection.toLowerCase()} found matching the query.`);
        }
  
        return {
            data,
            totalObject: total,
            pageSize: dto.limit,
            currentPage: dto.page,
            totalPage: Math.ceil(total / dto.limit),
            message: `${collection}s successfully found.`,
            status: HttpStatus.OK,
        };
  
    } catch (error) {
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
            throw error; 
        }

        throw new InternalServerErrorException({
            message: `Could not fetch ${collection.toLowerCase()}.`
        });
    }
  }


  async findOneWithQuery(key: string, value: any, collection: string): Promise<any> {
    try {
      const fieldValue =
        key === '_id' && typeof value === 'string'
          ? new ObjectId(value)
          : value;

      const options: FindOneOptions<any> = {
        where: {
          [key]: fieldValue,
        },
      };

      const record = await this.repository.findOne(options);

      if (!record) {
        throw new NotFoundException(`No ${collection}.toLowerCase() found with key: '${key}' and value: '${value}'`);
      }

      return {
        data: record,
        message: `${collection} found`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(`An unexpected error occurred while querying the ${collection}.toLowerCase()`);
      }
    }
  }

  private handleDatabaseError(error: any, message: string): void {
    if (error instanceof QueryFailedError) {
      throw new InternalServerErrorException(`${message}: ${error.message}`);
    }  else if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(`${message}: Duplicate entry`);
    } else {
      throw new InternalServerErrorException(message);
    }
  }
}
