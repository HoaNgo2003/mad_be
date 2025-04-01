import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  body: string;
}
