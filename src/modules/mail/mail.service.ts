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
}
