import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { Demo } from './entities/demo.entity';
import { CreateDemoDto } from './dtos/create-demo.dto';
import { UpdateDemoDto } from './dtos/update-demo.dto';
import { RequestDemoDto } from './dtos/request-demo.dto';
import { GenericRepository } from 'src/common/utils/generic-repository';

import {
  AdminDemoDetailSerializer,
  AdminDemoListSerializer,
  DemoDetailSerializer,
  DemoListSerializer,
  VendorDemoDetailSerializer,
  VendorDemoListSerializer,
} from './demo.serializer';

@Injectable()
export class DemoService {
  private collection = 'Demo';
  private genericRepository: GenericRepository;

  constructor(
    @InjectRepository(Demo) private demoRepository: Repository<Demo>,
  ) {
    this.genericRepository = new GenericRepository(
      this.demoRepository,
      DemoDetailSerializer,
      DemoListSerializer,
      VendorDemoDetailSerializer,
      VendorDemoListSerializer,
      AdminDemoDetailSerializer,
      AdminDemoListSerializer,
    );
  }
  async create(dto: CreateDemoDto) {
    const existingDemo = await this.demoRepository.findOne({
      where: {
        name: dto.name,
        description: dto.description,
      },
    });

    if (existingDemo) {
      throw new BadRequestException('A Demo with the same name already exists');
    }

    return await this.genericRepository.create(dto, this.collection);
  }

  async findOne(id: string) {
    return await this.genericRepository.findOne(
      { _id: new ObjectId(id) },
      this.collection,
    );
  }

  async update(id: string, dto: UpdateDemoDto) {
    return await this.genericRepository.update(
      { _id: new ObjectId(id) },
      dto,
      this.collection,
    );
  }

  async delete(id: string) {
    return await this.genericRepository.delete(
      { _id: new ObjectId(id) },
      this.collection,
    );
  }

  async findAll(dto: RequestDemoDto) {
    return await this.genericRepository.findAll(dto, this.collection);
  }

  async archive(id: string) {
    return await this.genericRepository.archive(
      { _id: new ObjectId(id) },
      this.collection,
    );
  }

  async restore(id: string) {
    return await this.genericRepository.restore(
      { _id: new ObjectId(id) },
      this.collection,
    );
  }

  async findArchive() {
    return await this.genericRepository.findArchive(this.collection);
  }
}
