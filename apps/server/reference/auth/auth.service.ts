import { Inject, Injectable } from '@nestjs/common';
import {
  createAuthAccount,
  createAuthSession,
  deleteAuthAccount,
  deleteAuthSession,
  getAuthAccountById,
  getAuthSessionByToken,
  listAuthAccountsByUser,
  listAuthSessionsByUser,
} from '@monorepo-template/db/example';
import type {
  CreateAuthAccountInput,
  CreateAuthSessionInput,
} from '@monorepo-template/db/example';

import { EXAMPLE_DB } from '../database/database.constants';
import type { ExampleDb } from '../database/database.module';

@Injectable()
export class AuthService {
  constructor(@Inject(EXAMPLE_DB) private readonly db: ExampleDb) {}

  createAccount(input: CreateAuthAccountInput) {
    return createAuthAccount(this.db, input);
  }

  findAccount(id: string) {
    return getAuthAccountById(this.db, id);
  }

  findAccountsByUser(userId: string) {
    return listAuthAccountsByUser(this.db, userId);
  }

  removeAccount(id: string) {
    return deleteAuthAccount(this.db, id);
  }

  createSession(input: CreateAuthSessionInput) {
    return createAuthSession(this.db, input);
  }

  findSessionByToken(token: string) {
    return getAuthSessionByToken(this.db, token);
  }

  findSessionsByUser(userId: string) {
    return listAuthSessionsByUser(this.db, userId);
  }

  removeSession(id: string) {
    return deleteAuthSession(this.db, id);
  }
}
