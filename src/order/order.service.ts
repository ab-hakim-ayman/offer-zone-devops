import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericRepository } from 'src/common/utils/generic-repository';
import { Product } from 'src/product/entities/product.entity';
import { Repository, MongoRepository } from 'typeorm';
import { MongoClient, ObjectId } from 'mongodb';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderListSerializer, OrderDetailSerializer, AdminOrderListSerializer, AdminOrderDetailSerializer, VendorOrderDetailSerializer, VendorOrderListSerializer } from './order.serializer';
import { RequestOrderDto } from './dtos/request-order.dto';


@Injectable()
export class OrderService {
  private collection = 'Order';
  private genericRepository: GenericRepository;
  private readonly mongoClient: MongoClient;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Order)
    private orderRepository: MongoRepository<Order>,
  ) {
    this.genericRepository = new GenericRepository(
      this.orderRepository,
      OrderDetailSerializer,
      OrderListSerializer,
      AdminOrderDetailSerializer,
      AdminOrderListSerializer,
      VendorOrderDetailSerializer,
      VendorOrderListSerializer
    );
    this.mongoClient = new MongoClient(process.env.DATABASE_URL);
  }

  async create(dto: CreateOrderDto) {
    let productArray = [];
    let totalPrice: number = 0;
    let totalProfit: number = 0;
  
    for (const product of dto.products) {
      try {
        const queryProduct = await this.productRepository.findOne({
          _id: new ObjectId(product._id),
        } as any);
  
        if (!queryProduct) {
          console.error(`Product not found for _id: ${product._id}`);
          continue;
        }
  
        const purchasePrice = queryProduct.purchasePrice;
        const sellPrice = queryProduct.sellPrice;
        const stockQuantity = queryProduct.stockQuantity;
        const cartQuantity = product.cartQuantity;
  
        if (
          purchasePrice == null ||
          sellPrice == null ||
          cartQuantity == null
        ) {
          console.error(`Invalid data for product: ${product._id}`);
          continue;
        }
  
        if (stockQuantity < cartQuantity) {
          console.error(
            `Insufficient stock for product ${product._id}: Available (${stockQuantity}), Required (${cartQuantity})`
          );
          continue;
        }
  
        queryProduct.stockQuantity -= cartQuantity;
  
        await this.productRepository.save(queryProduct);
  
        const subTotalPrice = cartQuantity * sellPrice;
        const subTotalProfit = cartQuantity * (sellPrice - purchasePrice);
  
        totalPrice += subTotalPrice;
        totalProfit += subTotalProfit;
  
        productArray.push({ ...product, sellPrice: sellPrice });
      } catch (error) {
        console.error(`Error processing product ${product._id}:`, error);
        continue;
      }
    }
  
    if (productArray.length > 0) {
      try {
        return await this.genericRepository.create(
          {
            ...dto,
            products: productArray,
            price: totalPrice,
            profit: totalProfit,
          },
          this.collection
        );
      } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Order creation failed');
      }
    } else {
      throw new Error('No product available for purchase or insufficient stock');
    }
  }
  

  async findOne(id: string) {
    return await this.genericRepository.findOne({ _id: new ObjectId(id) }, this.collection);
  }

  async update(id: string, dto: UpdateOrderDto) {
    return await this.genericRepository.update({ _id: new ObjectId(id) }, dto, this.collection);
  }

  async delete(id: string) {
    return await this.genericRepository.delete({ _id: new ObjectId(id) }, this.collection);
  }

  async findAll(dto: RequestOrderDto) {
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
