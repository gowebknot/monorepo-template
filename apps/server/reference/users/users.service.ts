import { Inject, Injectable } from '@nestjs/common';
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from '@repo/db/example';
import type { CreateUserInput, UpdateUserInput } from '@repo/db/example';

import { EXAMPLE_DB } from '../database/database.constants';
import type { ExampleDb } from '../database/database.module';

@Injectable()
export class UsersService {
  constructor(@Inject(EXAMPLE_DB) private readonly db: ExampleDb) {}

  create(input: CreateUserInput) {
    return createUser(this.db, input);
  }

  findAll() {
    return listUsers(this.db);
  }

  findOne(id: string) {
    return getUserById(this.db, id);
  }

  update(id: string, input: UpdateUserInput) {
    return updateUser(this.db, id, input);
  }

  remove(id: string) {
    return deleteUser(this.db, id);
  }
}
