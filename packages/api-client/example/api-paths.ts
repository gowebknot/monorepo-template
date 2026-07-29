import { buildPath } from "@/api-paths";

export const referenceApiRouteTemplates = {
  users: {
    collection: "/users",
    detail: "/users/:id"
  },
  todos: {
    collection: "/todos",
    detail: "/todos/:id"
  },
  todoItems: {
    collection: "/todo-items",
    detail: "/todo-items/:id"
  },
  authAccounts: {
    collection: "/auth/accounts",
    detail: "/auth/accounts/:id"
  },
  authSessions: {
    collection: "/auth/sessions",
    detail: "/auth/sessions/:id",
    byToken: "/auth/sessions/token/:token"
  }
} as const;

export const referenceApiPaths = {
  users: {
    collection: () => referenceApiRouteTemplates.users.collection,
    detail: (id: string) =>
      buildPath(referenceApiRouteTemplates.users.detail, { id })
  },
  todos: {
    collection: () => referenceApiRouteTemplates.todos.collection,
    detail: (id: string) =>
      buildPath(referenceApiRouteTemplates.todos.detail, { id })
  },
  todoItems: {
    collection: () => referenceApiRouteTemplates.todoItems.collection,
    detail: (id: string) =>
      buildPath(referenceApiRouteTemplates.todoItems.detail, { id })
  },
  authAccounts: {
    collection: () => referenceApiRouteTemplates.authAccounts.collection,
    detail: (id: string) =>
      buildPath(referenceApiRouteTemplates.authAccounts.detail, { id })
  },
  authSessions: {
    collection: () => referenceApiRouteTemplates.authSessions.collection,
    detail: (id: string) =>
      buildPath(referenceApiRouteTemplates.authSessions.detail, { id }),
    byToken: (token: string) =>
      buildPath(referenceApiRouteTemplates.authSessions.byToken, { token })
  }
} as const;
