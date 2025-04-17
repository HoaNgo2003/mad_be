import { ApiProperty } from '@dataui/crud/lib/crud';
import { IsNotEmpty, IsString } from 'class-validator';

export class ParamIdPlantCareProcessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
