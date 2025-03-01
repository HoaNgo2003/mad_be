import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  refershToken: string;
}
