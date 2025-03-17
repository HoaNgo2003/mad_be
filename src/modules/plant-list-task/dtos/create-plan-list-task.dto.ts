import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlantListTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  task: string;
}
