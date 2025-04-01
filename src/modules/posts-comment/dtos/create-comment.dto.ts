import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostCommentDto {
  @ApiProperty({ example: 'Very good!!' })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  content: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  replied_user_id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  post_id: string;
}

export class UpdatePostCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  content: string;
}
