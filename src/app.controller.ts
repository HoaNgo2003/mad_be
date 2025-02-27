import {
  Controller,
  Request,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { LocalAuthGuard } from './modules/auth/local-auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @Post('/test-mail')
  @HttpCode(HttpStatus.OK)
  public async welcome() {
    this.eventEmitter.emitAsync('user.welcome', {
      email: 'hngo34048@gmail.com',
      name: 'Hello! Hoa hehe',
    });

    return { message: 'success' };
  }
}
