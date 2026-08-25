import {
  boolean,
  index,
  pgSchema,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";

const auth = pgSchema("auth");

const createdAt = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull();

export const user = auth.table(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt,
    updatedAt
  },
  (table) => [uniqueIndex("user_email_unique").on(table.email)]
);

export const session = auth.table(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt,
    updatedAt,
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
  },
  (table) => [
    uniqueIndex("session_token_unique").on(table.token),
    index("session_user_id_index").on(table.userId)
  ]
);

export const account = auth.table(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("account_provider_account_unique").on(
      table.providerId,
      table.accountId
    ),
    index("account_user_id_index").on(table.userId)
  ]
);

export const verification = auth.table(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt,
    updatedAt
  },
  (table) => [index("verification_identifier_index").on(table.identifier)]
);

export const authTables = {
  user,
  session,
  account,
  verification
};
