import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Validate, IsNotEmpty } from 'class-validator';
import { IsUserNotFoundContraints } from 'src/common/validators/user.validate';

export class VerifyUserDto {
  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'User email' })
  @Validate(IsUserNotFoundContraints, [{ field: 'email' }], {
    message: 'User not found',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
