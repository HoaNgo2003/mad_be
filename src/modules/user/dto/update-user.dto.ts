import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsOptional()
  profile_picture: string;
}
