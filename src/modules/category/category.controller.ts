import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { CrudRequest, ParsedRequest } from '@dataui/crud';

@ApiTags('Category')
@Controller({
  version: '1',
  path: 'category',
})
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createOne(dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMany(@ParsedRequest() req: CrudRequest) {
    const { parsed } = req;
    parsed.filter = [...parsed.filter];
    parsed.limit = 10;
    return this.categoryService.getMany(parsed);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: CreateCategoryDto,
  ) {
    const category = await this.categoryService.getOne({
      filter: [{ field: 'id', operator: 'eq', value: id }],
    });
    if (!category) {
      throw new BadRequestException('Không tìm thấy danh mục');
    }
    return this.categoryService.updateOne(
      {
        filter: [{ field: 'id', operator: 'eq', value: id }],
      },
      dto,
    );
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async deleteCategory(@Param('id') id: string) {
    const category = await this.categoryService.getOne({
      filter: [{ field: 'id', operator: 'eq', value: id }],
    });
    if (!category) {
      throw new BadRequestException('Không tìm thấy danh mục');
    }
    return this.categoryService.hardDeleteOne({
      filter: [{ field: 'id', operator: 'eq', value: id }],
    });
  }
}
