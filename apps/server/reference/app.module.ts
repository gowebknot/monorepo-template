import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TodoItemsModule } from './todo-items/todo-items.module';
import { TodosModule } from './todos/todos.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    TodosModule,
    TodoItemsModule,
    AuthModule,
  ],
})
export class ReferenceAppModule {}
