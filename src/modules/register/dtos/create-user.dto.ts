import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Validate, IsNotEmpty } from 'class-validator';
import { IsUserExistContraints } from 'src/common/validators/user.validate';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'User email' })
  @Validate(IsUserExistContraints, [{ field: 'email' }], {
    message: 'User with this email already exists',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
