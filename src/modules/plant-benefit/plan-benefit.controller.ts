import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { PlantBenefit } from './entities/plant-benefit.entity';
import { Swagger } from '@dataui/crud/lib/crud';
import { CrudRequest, ParsedRequest } from '@dataui/crud';
import { PlantBenefitService } from './plan-benefit.service';
import { ParamIdPlantBenefitDto } from './dtos/paramID.dto';

@ApiTags('Plant Benefit')
@Controller({
  version: '1',
  path: 'plant-benefit',
})
export class PlantBenefitController {
  constructor(private readonly plantBenefitService: PlantBenefitService) {
    // Swagger metadata setup (for getMany)
    const getManyMetadata = Swagger.getParams(this.getMany);
    const getByIdMetadata = Swagger.getParams(this.getOne);
    const getManyQueryParamsMeta = Swagger.createQueryParamsMeta(
      'getManyBase',
      {
        model: { type: PlantBenefit },
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
  @ApiOperation({ summary: 'Get all plant benefits with pagination' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMany(@ParsedRequest() req: CrudRequest) {
    const { parsed } = req;
    parsed.filter = [...parsed.filter];
    parsed.limit = 10;
    return this.plantBenefitService.getMany(parsed);
  }

  @Public()
  @ApiOperation({
    summary: 'Get all plant benefits for a specific plant',
  })
  @Get('/by-plant/:plantId')
  @HttpCode(HttpStatus.OK)
  async getByPlantId(
    @ParsedRequest() req: CrudRequest,
    @Param('plantId') plantId: string,
  ) {
    const { parsed } = req;
    parsed.filter = [
      ...parsed.filter,
      {
        field: 'plant.id',
        operator: 'eq',
        value: plantId,
      },
    ];
    return this.plantBenefitService.getMany(parsed);
  }

  @Public()
  @ApiOperation({ summary: 'Get one plant benefit by id' })
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getOne(
    @ParsedRequest() req: CrudRequest,
    @Param() paramId: ParamIdPlantBenefitDto,
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
    return this.plantBenefitService.getOne(parsed);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plant benefit by id' })
  async deleteOne(@Param() param: ParamIdPlantBenefitDto) {
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
}
