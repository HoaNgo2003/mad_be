import { ApiProperty } from '@dataui/crud/lib/crud';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsUserNotFoundContraints } from 'src/common/validators/user.validate';

export class UserIdDto {
  @ApiProperty()
  @Validate(IsUserNotFoundContraints, [{ field: 'id' }], {
    message: 'Người dùng không tồn tại',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
