import { Body, Post, Controller } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dtos/login.dto';
import { LoginService } from './login.service';
@ApiTags('Login')
@Controller({
  version: '1',
  path: 'login',
})
export class LoginController {
  constructor(private readonly service: LoginService) {}

  @Post()
  @ApiOperation({ summary: 'Login' })
  async login(@Body() body: LoginUserDto) {
    return await this.service.login(body);
  }
}
