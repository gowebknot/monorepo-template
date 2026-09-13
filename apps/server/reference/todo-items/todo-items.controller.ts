import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type {
  CreateTodoItemInput,
  UpdateTodoItemInput,
} from '@monorepo-template/db/example';

import { TodoItemsService } from '#reference/todo-items/todo-items.service';

@Controller('todo-items')
export class TodoItemsController {
  constructor(private readonly todoItemsService: TodoItemsService) {}

  @Post()
  create(@Body() input: CreateTodoItemInput) {
    return this.todoItemsService.create(input);
  }

  @Get()
  findByTodo(@Query('todoId') todoId: string) {
    return this.todoItemsService.findByTodo(todoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todoItemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateTodoItemInput) {
    return this.todoItemsService.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoItemsService.remove(id);
  }
}
