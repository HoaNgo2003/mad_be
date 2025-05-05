import {
  Body,
  Post,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PlantService } from './plant.service';
import { CreatePlantDto, NameQuery, QueryName } from './dtos/create-plants.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { Plant } from './entities/plant.entity';
import { Swagger } from '@dataui/crud/lib/crud';
import { CrudRequest, ParsedRequest } from '@dataui/crud';
import {
  ParamIdCategory,
  ParamIdPlantBenefitDto,
  ParamIdPlantDto,
} from './dtos/paramId.dto';
import { UpdatePlantDto } from './dtos/update-plants.dto';
import { PlantBenefitService } from '../plant-benefit/plan-benefit.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from '../upload/upload.service';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { PlantSearchHistoryService } from '../plant-search-history/plant-search-history.service';

@ApiTags('Plant')
@Controller({
  version: '1',
  path: 'plant',
})
export class PlantController {
  constructor(
    private readonly plantService: PlantService,
    private readonly plantBenefitService: PlantBenefitService,
    private readonly uploadService: UploadService,
    private readonly searchHistoryService: PlantSearchHistoryService,
  ) {
    // Swagger metadata setup (for getMany)
    const getManyMetadata = Swagger.getParams(this.getMany);
    const getByIdMetadata = Swagger.getParams(this.getOne);
    const getManyQueryParamsMeta = Swagger.createQueryParamsMeta(
      'getManyBase',
      {
        model: { type: Plant },
        query: {
          softDelete: false,
        },
      },
    );
    Swagger.setParams(
      [...getManyMetadata, ...getManyQueryParamsMeta],
      this.getMany,
    );
    Swagger.setParams(
      [...getByIdMetadata, ...getManyQueryParamsMeta],
      this.getOne,
    );
  }
  @Public()
  @ApiOperation({
    summary: 'Get all plants with pagination',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMany(@ParsedRequest() req: CrudRequest) {
    const { parsed } = req;
    parsed.filter = [...parsed.filter];
    parsed.limit = 10;
    return this.plantService.getMany(parsed);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get one plants by id',
  })
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getOne(
    @CurrentUser() user: User,
    @ParsedRequest() req: CrudRequest,
    @Param() paramId: ParamIdPlantDto,
  ) {
    const { parsed } = req;

    // Thêm filter để tìm cây theo ID
    parsed.filter = [
      ...parsed.filter,
      {
        field: 'id',
        operator: 'eq',
        value: paramId.id,
      },
    ];

    // Lấy thông tin cây
    const plant = await this.plantService.getOne(parsed);

    // Lưu lịch sử tìm kiếm
    if (user) {
      await this.searchHistoryService.createPlantSearchHistory(user.id, {
        keyword: 'Chi tiết cây',
        plantId: plant.id,
      });

      console.log('Lưu lịch sử tìm kiếm cây');
    }

    return plant;
  }

  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Create one plant with benefits & process cares' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category_id: { type: 'string' },
        environment: { type: 'string' },
        usage: { type: 'string' },
        take_care: { type: 'string' },
        file: { type: 'string', format: 'binary' },
        plant_benefits: {
          type: 'string',
          example: '[{"title": "Benefit 1", "items": ["item 1", "item 2"]}]',
        },
        plant_processes: {
          type: 'string',
          example:
            '[{"type": "daily", "list_tasks": [{"time": "08:00", "task": "Water plant"}]}]',
        },
      },
    },
  })
  async createPlant(
    @Body() dto: CreatePlantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const { url } = await this.uploadService.uploadFile(file);
      dto.plant_url = url;
    }
    return this.plantService.createOnePlant(dto);
  }

  @Public()
  @Post('/benefits/plant-name')
  @ApiOperation({ summary: 'get benefits by plan name' })
  async getBenefitsByPlanName(
    @ParsedRequest() req: CrudRequest,
    @Body() dto: NameQuery,
  ) {
    const { parsed } = req;
    parsed.filter = [
      ...parsed.filter,
      { field: 'name', operator: 'cont', value: dto.name },
    ];
    parsed.join = [...parsed.join, { field: 'plant_benefits' }];
    return this.plantService.getOne(parsed);
  }

  @ApiBearerAuth()
  @Post('/search/plant')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Get plant by name or search with an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        plant_google_name: { type: 'string' },
      },
    },
  })
  async searchPlantByName(
    @ParsedRequest() req: CrudRequest,
    @Body() dto: QueryName,
    @CurrentUser() user: User,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const { parsed } = req;

    let searchHistoryDto = {
      plant_google_name: dto.plant_google_name || null,
      keyword: dto.name,
      plant_url: null,
      user,
    };
    if (file) {
      const { url } = await this.uploadService.uploadFile(file);
      console.log('Uploaded file URL:', url);
      searchHistoryDto.plant_url = url;
    }

    if (dto?.plant_google_name) {
      parsed.filter = [
        ...parsed.filter,
        { field: 'name', operator: 'cont', value: dto.plant_google_name },
      ];
    }

    if (dto?.name) {
      parsed.filter = [
        ...parsed.filter,
        { field: 'name', operator: 'cont', value: dto.name },
      ];
    }
    await this.searchHistoryService.createOne({
      keyword: dto.name,
      plant_google_name: dto.plant_google_name,
      plant_url: file ? file.path : null,
      user,
    });
    parsed.join = [
      ...parsed.join,
      { field: 'plant_benefits' },
      { field: 'plant_processes' },
    ];
    parsed.limit = 10;
    return this.plantService.getMany(parsed);
  }

  @Public()
  @Post('process/plant-name')
  @ApiOperation({ summary: 'get process by plan name' })
  async getProcessByPlanName(
    @ParsedRequest() req: CrudRequest,
    @Body() dto: NameQuery,
  ) {
    const { parsed } = req;
    parsed.filter = [
      ...parsed.filter,
      { field: 'name', operator: 'cont', value: dto.name },
    ];
    parsed.join = [...parsed.join, { field: 'plant_processes' }];
    return this.plantService.getOne(parsed);
  }

  @Public()
  @Delete('delete-plant-benefit/:id')
  async deleteOnePlantBenefit(@Param() param: ParamIdPlantBenefitDto) {
    return this.plantBenefitService.hardDeleteOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: param.id,
        },
      ],
    });
  }
  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete plant by id' })
  async deleteOne(@Param() param: ParamIdPlantDto) {
    return this.plantService.hardDeleteOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: param.id,
        },
      ],
    });
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update plant by id' })
  async updateOne(
    @Param() param: ParamIdPlantDto,
    @Body() dto: UpdatePlantDto,
  ) {
    return this.plantService.updateOnePlant(dto, param.id);
  }

  @Public()
  @Get('plant-by-category/:id')
  @ApiOperation({ summary: 'Get plant by category' })
  async getPlantByCategory(@Param() param: ParamIdCategory) {
    return this.plantService.getPlantByCategory(param.id);
  }
}
