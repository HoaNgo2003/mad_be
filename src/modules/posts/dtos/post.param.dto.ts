import { ApiProperty } from '@dataui/crud/lib/crud';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsPostExistContraints } from 'src/common/validators/post.validate';

export class PostsIdDto {
  @ApiProperty()
  @Validate(IsPostExistContraints, [{ field: 'id' }], {
    message: 'Post not found',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
