import { ApiProperty } from '@dataui/crud/lib/crud';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class PlantBenefitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  items: string[];
}
