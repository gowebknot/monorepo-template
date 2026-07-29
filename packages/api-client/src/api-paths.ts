export const apiBasePath = "/api/v1";

export type PathParams = Record<string, string | number>;

export function buildPath(template: string, params: PathParams = {}) {
  let path = template;

  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  }

  return path;
}

export function createResourcePaths(resourceName: string) {
  const collection = `${apiBasePath}/${resourceName}`;

  return {
    collection: () => collection,
    detail: (id: string | number) => buildPath(`${collection}/:id`, { id })
  };
}
