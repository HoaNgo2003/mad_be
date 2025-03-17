import { Body, Post, Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dtos/login.dto';
import { LoginService } from './login.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { Public } from 'src/common/decorator/public.decorator';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@ApiTags('Login')
@Controller({
  version: '1',
  path: 'login',
})
export class LoginController {
  constructor(private readonly service: LoginService) {}

  @Public()
  // @UseGuards(LocalAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Login' })
  async login(@Body() body: LoginUserDto) {
    return await this.service.login(body);
  }
}
