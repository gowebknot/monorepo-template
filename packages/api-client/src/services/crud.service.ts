import type { ServiceOptions } from "@/client/axios-instance";
import { getClient } from "@/client/axios-instance";

export interface ResourcePaths {
  collection: () => string;
  detail: (id: string) => string;
}

export function createCrudService<T, CreateInput, UpdateInput>(
  paths: ResourcePaths
) {
  return {
    async list(options?: ServiceOptions) {
      const response = await getClient(options).get<T[]>(paths.collection());
      return response.data;
    },

    async detail(id: string, options?: ServiceOptions) {
      const response = await getClient(options).get<T>(paths.detail(id));
      return response.data;
    },

    async create(input: CreateInput, options?: ServiceOptions) {
      const response = await getClient(options).post<T>(
        paths.collection(),
        input
      );
      return response.data;
    },

    async update(id: string, input: UpdateInput, options?: ServiceOptions) {
      const response = await getClient(options).patch<T>(
        paths.detail(id),
        input
      );
      return response.data;
    },

    async remove(id: string, options?: ServiceOptions) {
      const response = await getClient(options).delete<T>(paths.detail(id));
      return response.data;
    }
  };
}

export type CrudService<T, CreateInput, UpdateInput> = ReturnType<
  typeof createCrudService<T, CreateInput, UpdateInput>
>;
