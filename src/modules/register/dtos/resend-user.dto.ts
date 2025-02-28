import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Validate, IsNotEmpty } from 'class-validator';
import { IsUserNotFoundContraints } from 'src/common/validators/user.validate';

export class ResendOTPDto {
  @ApiProperty({ example: 'johndoe@example.com', description: 'User email' })
  @Validate(IsUserNotFoundContraints, [{ field: 'email' }], {
    message: 'User not found',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
