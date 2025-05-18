import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdentifyPlantDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsNotEmpty()
  image: any;
}
