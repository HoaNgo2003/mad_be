import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@dataui/crud/lib/crud';
import { CreatePlantCareProcessDto } from './create-plan-care-process.dto';

export class CreateBulkPlantCareProcessDto {
  @ApiProperty({ type: CreatePlantCareProcessDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlantCareProcessDto)
  @IsOptional()
  plants: CreatePlantCareProcessDto[];
}
