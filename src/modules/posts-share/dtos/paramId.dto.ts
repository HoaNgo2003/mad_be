import { ApiProperty } from '@dataui/crud/lib/crud';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsPostsLikeExistContraints } from 'src/common/validators/post-like.validate';
import { IsPostExistContraints } from 'src/common/validators/post.validate';

export class ParamIdPostsDto {
  @ApiProperty()
  @Validate(IsPostExistContraints, [{ field: 'id' }], {
    message: 'Posts not found',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
