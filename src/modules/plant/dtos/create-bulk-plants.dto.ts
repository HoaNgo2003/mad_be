import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@dataui/crud/lib/crud';
import { CreatePlantDto } from './create-plants.dto';

export class CreateBulkPlantDto {
  @ApiProperty({ type: CreatePlantDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlantDto)
  @IsOptional()
  plants: CreatePlantDto[];
}
