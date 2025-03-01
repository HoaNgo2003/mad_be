import { Body, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { RegisterService } from './register.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { VerifyUserDto } from './dtos/verify.dto';
import { ResendDto } from './dtos/resend-otp.dto';
import { Public } from 'src/common/decorator/public.decorator';
@ApiTags('Register')
@Controller({
  version: '1',
  path: 'register',
})
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly userService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create new account' })
  async register(@Body() body: CreateUserDto) {
    const user = await this.registerService.createUser(body);
    const data = await this.registerService.sendOTP(user.email);
    this.eventEmitter.emit('user.active-account.send-otp', {
      email: user.email,
      otp: data.otp,
      expireAt: data.expired_at,
    });
    delete user.password;
    return user;
  }

  @Public()
  @Post('active-account')
  @ApiOperation({ summary: 'Verify OTP' })
  async verifyOTP(@Body() body: VerifyUserDto) {
    return await this.registerService.verifyOTP(body);
  }

  @Public()
  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP' })
  async resendOTP(@Body() body: ResendDto) {
    const data = await this.registerService.sendOTP(body.email);
    this.eventEmitter.emit('user.active-account.send-otp', {
      email: body.email,
      otp: data.otp,
      expireAt: data.expired_at,
    });
    return { message: 'OTP has been sent' };
  }
}
