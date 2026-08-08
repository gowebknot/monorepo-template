import { createCrudService } from "@/services/crud.service";
import type {
  CreateUserInput,
  UpdateUserInput,
  User
} from "@repo/entities/example";

import { referenceApiPaths } from "./api-paths";

export const userApi = createCrudService<
  User,
  CreateUserInput,
  UpdateUserInput
>(referenceApiPaths.users);
