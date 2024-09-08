import { Injectable, NotFoundException } from "@nestjs/common";
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
                    purchasePrice: product['Purchase Price'],
                    sellPrice: product['Sell Price'],
                    discountPrice: product['Discount Price'],
                    stockQuantity: product['Stock Quantity'],
                    tags: tagsArray,
                    images: imagesArray, 
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

 
  async create(dto: CreateProductDto) {
    return await this.genericRepository.create(dto, this.collection);
  }

  async findOne(id: string) {
    return await this.genericRepository.findOne({ _id: new ObjectId(id) }, this.collection);
  }

  async update(_id: string, dto: UpdateProductDto) {
    const objectId = new ObjectId(_id);

    const existingProduct = await this.findOne(_id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
    return await this.genericRepository.update({ _id: objectId }, dto, this.collection);
  }

  async delete(id: string) {
    return await this.genericRepository.delete({ _id: new ObjectId(id) }, this.collection);
  }

  async findAll(dto: RequestProductDto) {
    return await this.genericRepository.findAll(dto, this.collection);
  }

  async archive(id: string) {
    return await this.genericRepository.archive({ _id: new ObjectId(id) }, this.collection);
  }

  async restore(id: string) {
    return await this.genericRepository.restore({ _id: new ObjectId(id) }, this.collection);
  }

  async findArchive() {
    return await this.genericRepository.findArchive(this.collection);
  }
}
