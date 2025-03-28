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
import { Plant } from './modules/plant/entities/plant.entity';
import { PlantBenefit } from './modules/plant-benefit/entities/plant-benefit.entity';
import { PlantModule } from './modules/plant/plant.module';
import { PlantCareProcess } from './modules/plant-care-process/entities/plant-care-process.entity';
import { PlantListTask } from './modules/plant-list-task/entities/plan-list-task.entity';
import { PlantListTaskModule } from './modules/plant-list-task/plan-list-task.module';
import { PlantCareProcessModule } from './modules/plant-care-process/plant-care-process.module';
import { PlantWishList } from './modules/plant-wishlist/entities/plant-wishlist.entity';
import { PlantWishlistModule } from './modules/plant-wishlist/plan-wishlist.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { ScheduleRule } from './modules/schedules/entities/schedule-rule.entity';
import { ScheduleTask } from './modules/schedules/entities/schedule-task.entity';
import { PlantSearchHistory } from './modules/plant-search-history/entities/plant-search-history.entity';
import { PlantSearchHistoryModule } from './modules/plant-search-history/plant-search-history.module';
import { PostsComment } from './modules/posts-comment/entities/posts-comment.entity';
import { Posts } from './modules/posts/entities/posts.entity';
import { PostsLike } from './modules/posts-like/entities/posts-like.entity';
import { PostsShare } from './modules/posts-share/entities/posts-share.entity';
import { PostsLikeModule } from './modules/posts-like/posts-like.module';
import { PostsCommentModule } from './modules/posts-comment/posts-comment.module';
import { PostsModule } from './modules/posts/posts.module';
import { UserFollow } from './modules/user-follow/entities/user-follow.entity';
import { UserFollowModule } from './modules/user-follow/user.follow.module';

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
      entities: [
        User,
        UserRefreshToken,
        UserVerifyAccount,
        Plant,
        PlantBenefit,
        PlantCareProcess,
        PlantListTask,
        PlantWishList,
        ScheduleRule,
        ScheduleTask,
        PlantSearchHistory,
        PostsComment,
        Posts,
        PostsLike,
        PostsShare,
        UserFollow,
      ],
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
    PlantModule,
    PlantListTaskModule,
    PlantCareProcessModule,
    PlantWishlistModule,
    SchedulesModule,
    PlantSearchHistoryModule,
    PostsLikeModule,
    PostsCommentModule,
    PostsModule,
    UserFollowModule,
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
