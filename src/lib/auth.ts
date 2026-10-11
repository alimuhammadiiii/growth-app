import { randomUUID } from "node:crypto";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      timezone: {
        type: "string",
        input: true,
        required: true,
      },
    },
  },
  advanced: {
    database: {
      // users.id and all auth table ids are uuid columns.
      generateId: () => randomUUID(),
    },
  },
  plugins: [username()],
});

