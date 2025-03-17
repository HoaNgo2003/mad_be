import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Validate, IsNotEmpty } from 'class-validator';
import { IsUserNotFoundContraints } from 'src/common/validators/user.validate';

export class LoginUserDto {
  @ApiProperty({ example: 'Rabiloo@123', description: 'Password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'User email' })
  @Validate(IsUserNotFoundContraints, [{ field: 'email' }], {
    message: 'User not found',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ForgotPasswordOTPDto {
  @ApiProperty({ example: 'johndoe@example.com', description: 'User email' })
  @Validate(IsUserNotFoundContraints, [{ field: 'email' }], {
    message: 'User not found',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOTPDto {
  @ApiProperty({ description: 'OTP' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'Rabiloo@123', description: 'Password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Rabiloo@123', description: 'Password of the user' })
  @IsString()
  @IsNotEmpty()
  password2: string;

  @ApiProperty({ description: 'OTP' })
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
