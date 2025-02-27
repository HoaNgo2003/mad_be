import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // SMTP server (Gmail example)
        port: 587,
        secure: false, // true for 465, false for 587
        auth: {
          user: 'hoantp@rabiloo.com', // Your email
          pass: 'pvzo iquc atgx lrbe', // App password (Not your actual email password)
        },
      },
      defaults: {
        from: '"No Reply" <your-email@gmail.com>', // Default sender
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
