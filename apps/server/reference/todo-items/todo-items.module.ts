import { Module } from '@nestjs/common';

import { TodoItemsController } from '#reference/todo-items/todo-items.controller';
import { TodoItemsService } from '#reference/todo-items/todo-items.service';

@Module({
  controllers: [TodoItemsController],
  providers: [TodoItemsService],
  exports: [TodoItemsService],
})
export class TodoItemsModule {}
