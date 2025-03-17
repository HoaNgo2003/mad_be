import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlantBenefitDto } from 'src/modules/plant-benefit/dtos/create-plant-benefit.dto';
import { ApiProperty } from '@dataui/crud/lib/crud';
import { CreatePlantCareProcessDto } from 'src/modules/plant-care-process/dtos/create-plan-care-process.dto';

export class CreatePlantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: PlantBenefitDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlantBenefitDto)
  @IsOptional()
  plant_benefits: PlantBenefitDto[];

  @ApiProperty({ type: CreatePlantCareProcessDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlantCareProcessDto)
  @IsOptional()
  plant_processes: CreatePlantCareProcessDto[];
}
