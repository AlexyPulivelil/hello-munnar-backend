import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { SessionModule } from 'nestjs-session';
import { watchmanModule } from './watchman/watchman.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { nestMailer } from './config/constants';
import { AuthModule } from './auth/auth.module';
import { DestinationsModule } from './destinations/destinations.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { ActivitiesModule } from './activities/activities.module';
import { RoutesModule } from './routes/routes.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: nestMailer.transport,
        template: {
          dir: './templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.X_REDIS_HOST,
      port: process.env.X_REDIS_PORT,
    }),
    SessionModule.forRoot({
      session: {
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
      },
    }),
    AuthModule,
    watchmanModule,
    ConfigModule.forRoot(),
    DestinationsModule,
    FacilitiesModule,
    ActivitiesModule,
    RoutesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
