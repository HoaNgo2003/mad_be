import { Body, Post, Controller, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ForgotPasswordDto,
  ForgotPasswordOTPDto,
  LoginUserDto,
  VerifyOTPDto,
} from './dtos/login.dto';
import { LoginService } from './login.service';
import { Public } from 'src/common/decorator/public.decorator';
import { RegisterService } from '../register/register.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ErrorMessage } from 'src/common/error-message';

@ApiTags('Login')
@Controller({
  version: '1',
  path: 'login',
})
export class LoginController {
  constructor(
    private readonly service: LoginService,
    private readonly registerService: RegisterService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Login' })
  async login(@Body() body: LoginUserDto) {
    return await this.service.login(body);
  }

  @Public()
  @Post('/send-forgot-password-otp')
  async sendForgotPasswordOTP(@Body() dto: ForgotPasswordOTPDto) {
    const data = await this.registerService.sendOTP(dto.email);
    this.eventEmitter.emit('user.forgot-password.send-otp', {
      email: dto.email,
      otp: data.otp,
      expireAt: data.expired_at,
    });
  }

  @Public()
  @Post('/verify/otp-reset-password')
  async verifyOTP(@Body() body: VerifyOTPDto) {
    const data = await this.service.verifyOTP(body.otp);
    if (!data) {
      throw new BadRequestException(ErrorMessage.User.optInvalid);
    }
    return { message: 'OTP verified successfully' };
  }

  @Public()
  @Post('/change-password')
  async changePassword(@Body() dto: ForgotPasswordDto) {
    return this.service.changePassword(dto);
  }
}
