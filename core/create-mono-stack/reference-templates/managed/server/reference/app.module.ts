import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateReferenceServerEnv } from '@monorepo-template/env/reference-server';

import { AuthModule } from '#reference/auth/auth.module';
import { DatabaseModule } from '#reference/database/database.module';
import { TodoItemsModule } from '#reference/todo-items/todo-items.module';
import { TodosModule } from '#reference/todos/todos.module';
import { UsersModule } from '#reference/users/users.module';

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
