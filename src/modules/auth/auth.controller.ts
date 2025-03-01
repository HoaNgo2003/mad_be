import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { LoginService } from '../login/login.service';
import { RefreshTokenDto } from '../login/dtos/refresh-token.dto';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth',
})
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginService: LoginService,
  ) {}

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  async logout(@CurrentUser() user: User) {
    return await this.loginService.logout(user.id);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  async refreshToken(@Body() body: RefreshTokenDto) {
    return await this.loginService.refreshToken(body.refershToken);
  }
}
