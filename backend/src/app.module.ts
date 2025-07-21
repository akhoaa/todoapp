import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000, // 1 second
      limit: 3, // 3 requests per second
    }, {
      name: 'medium',
      ttl: 10000, // 10 seconds
      limit: 20, // 20 requests per 10 seconds
    }, {
      name: 'long',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    TaskModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
