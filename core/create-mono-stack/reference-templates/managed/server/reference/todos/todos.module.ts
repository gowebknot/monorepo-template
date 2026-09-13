import { Module } from '@nestjs/common';

import { TodosController } from '#reference/todos/todos.controller';
import { TodosService } from '#reference/todos/todos.service';

@Module({
  controllers: [TodosController],
  providers: [TodosService],
  exports: [TodosService],
})
export class TodosModule {}
