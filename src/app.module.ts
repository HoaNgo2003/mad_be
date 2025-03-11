import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entities/user.entity';
import { UsersModule } from './modules/user/user.module';
import { UserRefreshToken } from './modules/user-refresh-token/entities/user-refresh-token.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UserVerifyAccount } from './modules/user-verify-account/entities/user-verify-account.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailModule } from './modules/mail/mail.module';
import { UploadModule } from './modules/upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { RegisterModule } from './modules/register/register.module';
import { UserSubscriber } from './modules/user/user.subcriber';
import { LoginModule } from './modules/login/login.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available throughout the app
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: `${process.env.DB_USERNAME}`,
      password: `${process.env.DB_PASSWORD}`,
      database: `${process.env.DB_NAME}`,
      entities: [User, UserRefreshToken, UserVerifyAccount],
      synchronize: true,
      subscribers: [UserSubscriber],
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    MailModule,
    EventEmitterModule.forRoot(),
    UploadModule,
    RegisterModule,
    LoginModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
