import {
  createMonorepoAuth,
  toNodeHandler,
} from '@monorepo-template/auth/server';
import { createPostgresDb } from '@monorepo-template/db';
import { serverEnv } from '@monorepo-template/env/server';

import { MONOREPO_AUTH_HANDLER } from '@/infra/auth/auth.constants';

export const authHandlerProvider = {
  provide: MONOREPO_AUTH_HANDLER,
  useFactory: () =>
    toNodeHandler(
      createMonorepoAuth({
        database: createPostgresDb(),
        environment: {
          BETTER_AUTH_URL: serverEnv.BETTER_AUTH_URL,
          BETTER_AUTH_SECRET: serverEnv.BETTER_AUTH_SECRET,
          AUTH_TRUSTED_ORIGINS: serverEnv.AUTH_TRUSTED_ORIGINS,
        },
      }),
    ),
};
