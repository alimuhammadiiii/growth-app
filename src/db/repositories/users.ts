import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema/users";

export async function emailExists(email: string): Promise<boolean> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return existing.length > 0;
}

export async function usernameExists(username: string): Promise<boolean> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return existing.length > 0;
}
