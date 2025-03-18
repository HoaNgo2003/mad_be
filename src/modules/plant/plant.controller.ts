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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlantService } from './plant.service';
import { CreatePlantDto, QueryName } from './dtos/create-plants.dto';
import { CreateBulkPlantDto } from './dtos/create-bulk-plants.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { Plant } from './entities/plant.entity';
import { Swagger } from '@dataui/crud/lib/crud';
import { CrudRequest, ParsedRequest } from '@dataui/crud';
import { ParamIdPlantBenefitDto, ParamIdPlantDto } from './dtos/paramId.dto';
import { UpdatePlantDto } from './dtos/update-plants.dto';
import { PlantBenefitService } from '../plant-benefit/plan-benefit.service';

@ApiTags('Plant')
@Controller({
  version: '1',
  path: 'plant',
})
export class PlantController {
  constructor(
    private readonly plantService: PlantService,
    private readonly plantBenefitService: PlantBenefitService,
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
    return this.plantService.getMany(parsed);
  }

  @Public()
  @ApiOperation({
    summary: 'Get one plants by id',
  })
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getOne(
    @ParsedRequest() req: CrudRequest,
    @Param() paramId: ParamIdPlantDto,
  ) {
    const { parsed } = req;
    parsed.filter = [
      ...parsed.filter,
      {
        field: 'id',
        operator: 'eq',
        value: paramId.id,
      },
    ];
    return this.plantService.getOne(parsed);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create one plant with benefits & process cares' })
  async createPlant(@Body() dto: CreatePlantDto) {
    return this.plantService.createOnePlant(dto);
  }

  @Public()
  @Post('/create-bulk-plan')
  @ApiOperation({ summary: 'Create many plant with benefits' })
  async createBulkPlant(@Body() dto: CreateBulkPlantDto) {
    return this.plantService.createBulkPlants(dto.plants);
  }

  @Public()
  @Post('/benefits/plant-name')
  @ApiOperation({ summary: 'get benefits by plan name' })
  async getBenefitsByPlanName(
    @ParsedRequest() req: CrudRequest,
    @Body() dto: QueryName,
  ) {
    const { parsed } = req;
    parsed.filter = [
      ...parsed.filter,
      { field: 'name', operator: 'cont', value: dto.name },
    ];
    parsed.join = [...parsed.join, { field: 'plant_benefits' }];
    return this.plantService.getOne(parsed);
  }

  @Public()
  @Post('/process/plant-name')
  @ApiOperation({ summary: 'get process by plan name' })
  async getProcessByPlanName(
    @ParsedRequest() req: CrudRequest,
    @Body() dto: QueryName,
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
  @Delete('/delete-plant-benefit/:id')
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
}
