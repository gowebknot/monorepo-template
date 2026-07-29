import { createCrudService } from "@/services/crud.service";
import type {
  CreateUserInput,
  UpdateUserInput,
  User
} from "@monorepo-template/entities/example";

import { referenceApiPaths } from "./api-paths";

export const userApi = createCrudService<
  User,
  CreateUserInput,
  UpdateUserInput
>(referenceApiPaths.users);
