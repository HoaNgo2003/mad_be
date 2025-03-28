import { ApiProperty } from '@dataui/crud/lib/crud';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsUserNotFoundContraints } from 'src/common/validators/user.validate';

export class UserIdDto {
  @ApiProperty()
  @Validate(IsUserNotFoundContraints, [{ field: 'id' }], {
    message: 'User not found',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
