import {
  Controller,
  Post,
  UseInterceptors,
  Body,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
  Patch,
  Delete,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { CreateProductValidationPipe } from './pipes/validation/create-product-validation.pipe';
import { UpdateProductValidationPipe } from './pipes/validation/update-product-validation.pipe';
import { ProductService } from './product.service';
import { RequestProductDto } from './dtos/request-product.dto';
import { RequestProductValidationPipe } from './pipes/validation/request-product-validation.pipe';
import { UploadExcelDto } from './dtos/upload-excel.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UseRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/enums/roles.enum';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file', multerConfig('xlsx', 'xlsx')))
  async uploadExcel(
    @Body() dto: UploadExcelDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.xlsx')) {
      throw new BadRequestException(
        'Invalid file type. Only .xlsx files are allowed',
      );
    }

    return await this.productService.uploadExcel(file, dto.action);
  }

  @Post('product')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor)
  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig('products', 'image')),
  )
  async create(
    @Body(CreateProductValidationPipe) dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    for (const file of files) {
      if (file.size > 1 * 1024 * 1024) {
        throw new BadRequestException('File size exceeds the limit of 1MB');
      }
    }

    dto.images = files.map((file) => file.filename);

    return this.productService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin)
  @Get('product/archives')
  findArchive() {
    return this.productService.findArchive();
  }

  @Get('product/:id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor)
  @Patch('product/:id')
  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig('products', 'image')),
  )
  async update(
    @Param('id') id: string,
    @Body(UpdateProductValidationPipe) dto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.size > 1 * 1024 * 1024) {
          throw new BadRequestException('File size exceeds the limit of 1MB');
        }
      }

      dto.images = files.map((file) => file.filename);
    }

    return this.productService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor)
  @Delete('product/archives/delete/:id')
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }

  @Post('products')
  findAll(@Body(RequestProductValidationPipe) dto: RequestProductDto) {
    return this.productService.findAll(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor)
  @Delete('product/:id')
  archive(@Param('id') id: string) {
    return this.productService.archive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor)
  @Post('product/archives/restore/:id')
  restore(@Param('id') id: string) {
    return this.productService.restore(id);
  }
}
