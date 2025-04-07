import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostCommentDto {
  @ApiProperty({
    example: 'Bài viết rất ý nghĩa!',
    description: 'Nội dung của comment',
  })
  @IsNotEmpty({ message: 'Nội dung comment không được để trống' })
  content: string;

  @ApiProperty({
    example: 'post_123abc',
    description: 'ID bài viết cần comment',
  })
  @IsString({ message: 'post_id phải là chuỗi' })
  post_id: string;

  @ApiProperty({
    example: 'comment_456def',
    description: 'ID comment cha nếu là reply, có thể không có',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'replied_user_id phải là chuỗi nếu có' })
  replied_user_id?: string;
}
export class UpdatePostCommentDto {
  @ApiProperty({
    example: 'Mình update  comment này nhé ',
    description: 'Nội dung comment mới',
  })
  @IsNotEmpty({ message: 'Nội dung comment không được để trống' })
  content: string;
}
