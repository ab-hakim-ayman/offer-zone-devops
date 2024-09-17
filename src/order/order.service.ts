import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
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

  async create(req: any, dto: CreateOrderDto) {
    let user = req.user;
    let productArray = [];
    let totalPrice: number = 0;
  
    for (const product of dto.products) {
      try {
        const queryProduct = await this.productRepository.findOne({
          _id: new ObjectId(product._id),
        } as any);
  
        if (!queryProduct) {
          console.error(`Product not found for _id: ${product._id}`);
          continue;
        }
  
        const price = queryProduct.price;
        const vendorEmail = queryProduct.vendorEmail;
        const vendorPhone = queryProduct.vendorPhone;
        const stockQuantity = queryProduct.stockQuantity;
        const cartQuantity = product.cartQuantity;
  
        if (
          price == null ||
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
  
        const subTotalPrice = cartQuantity * price;
  
        totalPrice += subTotalPrice;
  
        productArray.push({
          ...product,
          vendorEmail: vendorEmail,
          vendorPhone: vendorPhone
        });
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
            email: user.username,
            products: productArray,
            price: totalPrice,
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

  async update(_id: string, req: any, dto: UpdateOrderDto) {
    const objectId = new ObjectId(_id);
    const existingOrder = await this.findOne(_id);
    const product = existingOrder.products;
    const user = req.user;

    if (existingOrder && user.username === product.vendorEmail) {
      return await this.genericRepository.update({ _id: objectId }, dto, this.collection);
    } else if (existingOrder && user.username === 'admin') {
      return await this.genericRepository.update({ _id: objectId }, dto, this.collection);
    } else {
      throw new NotFoundException('Order not found');
    }
  }

  async delete(_id: string, req: any) {
    let existingOrder = await this.findOne(_id);
    const user = req.user;
    console.log(user.username);

    const hasVendorEmail = hasVendorEmailInOrder(existingOrder, user.username);
    console.log(hasVendorEmail);

    if ( existingOrder && hasVendorEmail ) {
      console.log('its works');
      return await this.genericRepository.delete({ _id: new ObjectId(_id) }, this.collection);
    } else if ( !existingOrder ) {
      throw new NotFoundException('Order not found');
    } else {
      throw new NotImplementedException('Order deletion failed');
    }
  }

  async findAll(req: any, dto: RequestOrderDto) {
    const user = req.user;

    let reqDto: any = { ...dto, isArchived: false };

    if (user.role === 'vendor') {
        reqDto.query = {
            ...dto.query,
            'products.vendorEmail': user.username
        };
        let orders = await this.genericRepository.findAll(reqDto, this.collection);
    } 
    else if (user.role === 'admin') {
        console.log(user.role);
        reqDto.query = {
            ...dto.query,
            'products.vendorEmail': dto.query?.vendorEmail || user.username 
        };
        console.log(reqDto);
    } 
    else {
        reqDto.email = user.username;
    }

    // return await this.genericRepository.findAll(reqDto, this.collection);
  }



  async archive(_id: string, req: any) {
    const objectId = new ObjectId(_id);
    let existingOrder = await this.findOne(_id);
    const user = req.user;
    console.log(user.username);

    const hasVendorEmail = hasVendorEmailInOrder(existingOrder, user.username);
    console.log(hasVendorEmail);

    if ( existingOrder && hasVendorEmail ) {
      console.log('its works');
      return await this.genericRepository.archive({ _id: new ObjectId(_id) }, this.collection);
    } else if ( existingOrder && user.role == 'admin') {
      return await this.genericRepository.archive({ _id: new ObjectId(_id) }, this.collection);
    } else {
      throw new NotFoundException('Order not found');
    }
  }

  async restore(_id: string, req: any) {
    let existingOrder = await this.findOne(_id);
    const user = req.user;
    console.log(user.username);

    const hasVendorEmail = hasVendorEmailInOrder(existingOrder, user.username);
    console.log(hasVendorEmail);

    if ( existingOrder && hasVendorEmail ) {
      console.log('its works');
      return await this.genericRepository.restore({ _id: new ObjectId(_id) }, this.collection);
    } else if ( existingOrder && user.role == 'admin') {
      return await this.genericRepository.restore({ _id: new ObjectId(_id) }, this.collection);
    } else {
      throw new NotFoundException('Order not found');
    }
  }

  async findArchive(req: any, dto: RequestOrderDto) {
    const user = req.user;

    if (user.role == 'vendor') {
      const reqDto = {
        ...dto,
        query: {
          'products.vendorEmail': user.username,
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

function hasVendorEmailInOrder(order: any, vendorEmail: any) {
  const products = order.data.products;
  return products.some(product => product.vendorEmail === vendorEmail);
}