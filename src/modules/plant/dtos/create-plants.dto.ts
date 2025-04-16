import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDefined,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PlantBenefitDto } from 'src/modules/plant-benefit/dtos/create-plant-benefit.dto';
import { ApiProperty } from '@dataui/crud/lib/crud';
import { CreatePlantCareProcessDto } from 'src/modules/plant-care-process/dtos/create-plan-care-process.dto';

export class CreatePlantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  plant_url?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  category_id: string;

  @IsOptional()
  file?: any;

  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
      return [];
    }
  })
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => PlantBenefitDto)
  @IsOptional()
  plant_benefits: PlantBenefitDto[];

  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
      return [];
    }
  })
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => CreatePlantCareProcessDto)
  @IsOptional()
  plant_processes: CreatePlantCareProcessDto[];
}

export class QueryName {
  @ApiProperty({ required: false, nullable: true })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsString()
  @IsOptional()
  plant_google_name?: string | null;

  @IsOptional()
  file?: any;
}
export class NameQuery {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  name: string;
}
