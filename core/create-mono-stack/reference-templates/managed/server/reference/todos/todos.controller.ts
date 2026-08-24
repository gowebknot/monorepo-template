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
import type { CreateTodoInput, UpdateTodoInput } from '@monorepo-template/db/example';

import { TodosService } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() input: CreateTodoInput) {
    return this.todosService.create(input);
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.todosService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateTodoInput) {
    return this.todosService.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
