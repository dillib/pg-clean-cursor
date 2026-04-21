import { users, isMasterAdminEmail, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations (used by WorkOS and session flows).
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const isAdmin = isMasterAdminEmail(userData.email);
    
    const existingByEmail = userData.email
      ? await db.select().from(users).where(eq(users.email, userData.email)).then(r => r[0])
      : undefined;

    if (existingByEmail) {
      const [user] = await db
        .update(users)
        .set({
          ...userData,
          isAdmin,
          updatedAt: new Date(),
        })
        .where(eq(users.email, userData.email!))
        .returning();
      return user;
    }

    const [user] = await db
      .insert(users)
      .values({ ...userData, isAdmin })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          isAdmin,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
