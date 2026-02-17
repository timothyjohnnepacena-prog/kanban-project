import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // The "as string" fixes the TypeScript error you see in your log
    MongooseModule.forRoot(process.env.DATABASE_URL as string),
    TasksModule,
    LogsModule,
  ],
})
export class AppModule {}