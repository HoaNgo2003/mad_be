import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlantCareProcessService } from './plant-care-process.service';
import { Public } from 'src/common/decorator/public.decorator';
import { PlantCareProcess } from './entities/plant-care-process.entity';
import { Swagger } from '@dataui/crud/lib/crud';
import { CrudRequest, ParsedRequest } from '@dataui/crud';
import { PlantListTaskService } from '../plant-list-task/plan-list-task.service';
import { ParamIdPlantCareProcessDto } from './dtos/paramID.dto';

@ApiTags('Plant Care Process')
@Controller({
  version: '1',
  path: 'plant-care-process',
})
export class PlantCareProcessController {
  constructor(
    private readonly plantCareProcessService: PlantCareProcessService,
    private readonly plantListTaskService: PlantListTaskService,
  ) {
    // Swagger metadata setup (for getMany)
    const getManyMetadata = Swagger.getParams(this.getMany);
    const getByIdMetadata = Swagger.getParams(this.getOne);
    const getManyQueryParamsMeta = Swagger.createQueryParamsMeta(
      'getManyBase',
      {
        model: { type: PlantCareProcess },
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
  @ApiOperation({ summary: 'Get all plant care processes with pagination' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMany(@ParsedRequest() req: CrudRequest) {
    const { parsed } = req;
    parsed.filter = [...parsed.filter];
    return this.plantCareProcessService.getMany(parsed);
  }

  @Public()
  @ApiOperation({
    summary: 'Get all plant care processes for a specific plant',
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
    return this.plantCareProcessService.getMany(parsed);
  }

  @Public()
  @ApiOperation({ summary: 'Get one plant care process by id' })
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getOne(
    @ParsedRequest() req: CrudRequest,
    @Param() paramId: ParamIdPlantCareProcessDto,
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
    return this.plantCareProcessService.getOne(parsed);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plant care process by id' })
  async deleteOne(@Param() param: ParamIdPlantCareProcessDto) {
    return this.plantCareProcessService.hardDeleteOne({
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
