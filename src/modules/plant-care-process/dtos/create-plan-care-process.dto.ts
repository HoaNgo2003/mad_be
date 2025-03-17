import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ESchedule } from 'src/common/types/data-type';
import { CreatePlantListTaskDto } from 'src/modules/plant-list-task/dtos/create-plan-list-task.dto';

export class CreatePlantCareProcessDto {
  @ApiProperty({
    description: `Type of schedule. Accepted values: ${Object.values(ESchedule).join(', ')}`,
    enum: ESchedule,
    example: ESchedule.daily,
  })
  @IsEnum(ESchedule)
  @IsNotEmpty()
  type: ESchedule;

  @ApiProperty({ type: CreatePlantListTaskDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlantListTaskDto)
  @IsDefined()
  list_tasks?: CreatePlantListTaskDto[];
}
