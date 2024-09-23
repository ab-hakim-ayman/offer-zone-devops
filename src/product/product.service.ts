import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as XLSX from 'xlsx';
import { InjectRepository } from "@nestjs/typeorm";
import { GenericRepository } from "src/common/utils/generic-repository";
import { Repository } from "typeorm";
import { ObjectId } from "mongodb";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { Product } from "./entities/product.entity";
import { ProductDetailSerializer, ProductListSerializer, AdminProductDetailSerializer, AdminProductListSerializer, VendorProductDetailSerializer, VendorProductListSerializer } from "./product.serializer";
import { RequestProductDto } from "./dtos/request-product.dto";


@Injectable()
export class ProductService {
  private collection = 'Product';
  private genericRepository: GenericRepository;

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>
  ) {
    this.genericRepository = new GenericRepository(
      this.productRepository,
      ProductDetailSerializer,
      ProductListSerializer,
      AdminProductDetailSerializer,
      AdminProductListSerializer,
      VendorProductDetailSerializer,
      VendorProductListSerializer
    );
  }

  async uploadExcel(file: Express.Multer.File, action: string) {
    if (action === 'overwrite' || action === 'append') {
        if (action === 'overwrite') {
            await this.genericRepository.deleteAll(this.collection);
        }

        try {
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const products = XLSX.utils.sheet_to_json(worksheet);
            const failedRecords = [];

            for (let product of products) {
                const tagsArray = typeof product['Tags'] === 'string' ? product['Tags'].split(',').map(tag => tag.trim()) : [];
                const imagesArray = typeof product['Images'] === 'string' ? product['Images'].split(',').map(image => image.trim()) : [];

                const object = {
                    title: product['Title'],
                    description: product['Description'],
                    price: product['Price'],
                    stockQuantity: product['Stock Quantity'],
                    tags: tagsArray,
                    images: imagesArray, 
                    vendorEmail: product['Vendor Email'],
                    vendorPhone: product['Vendor Phone'],
                    isPublished: true,
                    isFeatured: false,
                    isArchived: false
                };

                try {
                    await this.genericRepository.create(object, this.collection);
                } catch (error) {
                    failedRecords.push(product['Title']);
                }
            }

            if (failedRecords.length > 0) {
                return `Data processed with some errors. Failed to process products with titles: ${failedRecords.join(', ')}`;
            }

            return 'Excel file successfully processed';
        } catch (error) {
            throw new Error('Failed to process Excel file');
        }
    }

    return 'Invalid input file';
}

 
  async create(req: any, dto: CreateProductDto) {
    const user = req.user;
    const productData = {
      ...dto,
      vendorEmail: user.username,
      vendorPhone: user?.phone || null
    }
    return await this.genericRepository.create(productData, this.collection);
  }

  async findOne(id: string) {
    return await this.genericRepository.findOne({ _id: new ObjectId(id) }, this.collection);
  }

  async update(id: string, req: any, dto: UpdateProductDto) {
    const objectId = new ObjectId(id);
    const existingProduct = await this.findOne(id);
    console.log(existingProduct.data);
    const user = req.user;
  
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
  
    if (user.role === 'admin') {
      return await this.genericRepository.update({ _id: objectId }, dto, this.collection);
    }
  
    if (user.username === existingProduct.data['vendorEmail']) {
      const { category, isPublished, ...vendorUpdatableFields } = dto;
  
      return await this.genericRepository.update({ _id: objectId }, vendorUpdatableFields, this.collection);
    }
  
    throw new UnauthorizedException('You do not have permission to update this product');
  }
  

  async delete(_id: string, req: any) {
    const objectId = new ObjectId(_id);
    const existingProduct = await this.findOne(_id);
    const user = req.user;

    if (existingProduct && user.username === existingProduct.data['vendorEmail']) {
      return await this.genericRepository.delete({ _id: objectId }, this.collection);
    } else if ( existingProduct && user.role == 'admin') {
      return await this.genericRepository.delete({ _id: objectId }, this.collection);
    } else {
      throw new NotFoundException('Product not found');
    }
  }

  async findAll(req: any, dto: RequestProductDto) {
    const user = req.user;

    if (user.role == 'vendor') {
      const reqDto = {
        ...dto,
        query: {
          vendorEmail: user.username
        }
      }
      return await this.genericRepository.findAll(reqDto, this.collection);
    } else {
      return await this.genericRepository.findAll(dto, this.collection);
    }
  }

  async bypassFindAll(dto: RequestProductDto) {
    return await this.genericRepository.findAll(dto, this.collection);
  }

  async archive(_id: string, req: any) {
    const objectId = new ObjectId(_id);
    const existingProduct = await this.findOne(_id);
    const user = req.user;

    if ( existingProduct && user.username == existingProduct.data['vendorEmail'] ) {
      return await this.genericRepository.archive({ _id: new ObjectId(_id) }, this.collection);
    } else if ( existingProduct && user.role == 'admin') {
      return await this.genericRepository.archive({ _id: new ObjectId(_id) }, this.collection);
    } else {
      throw new NotFoundException('Product not found');
    }
  }

  async restore(_id: string, req: any) {
    const objectId = new ObjectId(_id);
    const existingProduct = await this.findOne(_id);
    const user = req.user;
    console.log(user.username, user.role);

    if ( existingProduct && user.username == existingProduct.data['vendorEmail'] ) {
      return await this.genericRepository.restore({ _id: new ObjectId(_id) }, this.collection);
    } else if ( existingProduct && user.role == 'admin') {
      return await this.genericRepository.restore({ _id: new ObjectId(_id) }, this.collection);
    } else {
      throw new NotFoundException('Product not found');
    }
  }

  async findArchive(req: any, dto: RequestProductDto) {
    const user = req.user;

    if (user.role == 'vendor') {
      const reqDto = {
        ...dto,
        query: {
          vendorEmail: user.username,
        },
        isArchived: true
      }
      return await this.genericRepository.findAll(reqDto, this.collection);
    } else {
      const rDto = {
        ...dto,
        isArchived: true
      }
      console.log(rDto);
      return await this.genericRepository.findAll(rDto, this.collection);
    }
  }
}
