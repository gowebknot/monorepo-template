import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateReferenceServerEnv } from '@repo/env/reference-server';

import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TodoItemsModule } from './todo-items/todo-items.module';
import { TodosModule } from './todos/todos.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        validateReferenceServerEnv(config),
    }),
    DatabaseModule,
    UsersModule,
    TodosModule,
    TodoItemsModule,
    AuthModule,
  ],
})
export class ReferenceAppModule {}
