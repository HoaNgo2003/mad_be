import { MailerService } from '@nestjs-modules/mailer/dist';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent('user.welcome')
  async welcomeEmail(data: any) {
    try {
      const { email, name } = data;
      const subject = `Welcome to Avocado Green Space: ${name}`;

      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        html: `Hello from Earth!`,
      });
    } catch (error) {
      return error;
    }
  }

  @OnEvent('user.active-account.send-otp')
  async sendOTPActiveAccount(data: {
    email: string;
    otp: string;
    expireAt: Date;
  }) {
    try {
      const { email, otp, expireAt } = data;

      await this.mailerService.sendMail({
        to: email,
        subject: `Active your account`,
        template: './active-account',
        context: {
          email,
          otp,
          expireMinutes: expireAt,
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @OnEvent('user.successfully-verified')
  async activeSuccess(data: { email: string; name: string }) {
    try {
      const { email, name } = data;

      await this.mailerService.sendMail({
        to: email,
        subject: `Active your account`,
        template: './success-active',
        context: {
          email,
          name,
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
