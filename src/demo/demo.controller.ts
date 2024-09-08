import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { DemoService } from './demo.service';
import { CreateDemoDto } from './dtos/create-demo.dto';
import { UpdateDemoDto } from './dtos/update-demo.dto';
import { RequestDemoDto } from './dtos/request-demo.dto';
import { UseRoles } from 'src/common/decorators/roles.decorator';
import { CreateDemoValidationPipe } from './pipes/validation/create-demo-validation.pipe';
import { UpdateDemoValidationPipe } from './pipes/validation/update-demo-validation.pipe';
import { RequestDemoValidationPipe } from './pipes/validation/request-demo-validation.pipe';

@Controller()
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('demo')
  create(@Body(CreateDemoValidationPipe) dto: CreateDemoDto) {
    return this.demoService.create(dto);
  }

  @Get('demo/archives')
  findArchive() {
    return this.demoService.findArchive();
  }

  @Get('demo/:id')
  findOne(@Param('id') id: string) {
    return this.demoService.findOne(id);
  }

  @Patch('demo/:id')
  update(
    @Param('id') id: string,
    @Body(UpdateDemoValidationPipe) dto: UpdateDemoDto,
  ) {
    return this.demoService.update(id, dto);
  }

  @Delete('demo/archives/delete/:id')
  delete(@Param('id') id: string) {
    return this.demoService.delete(id);
  }

  @Post('demos')
  findAll(@Body() dto: RequestDemoDto) {
    return this.demoService.findAll(dto);
  }

  @Delete('demo/:id')
  archive(@Param('id') id: string) {
    return this.demoService.archive(id);
  }

  @Post('demo/archives/restore/:id')
  restore(@Param('id') id: string) {
    return this.demoService.restore(id);
  }
}
