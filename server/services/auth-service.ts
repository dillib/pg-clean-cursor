import { storage } from "../storage";
import type { User, UpsertUser, Role, InsertRole } from "@shared/schema";

/**
 * Thin wrapper over {@link storage} for user/role reads.
 * Local username/password auth is not used with the current WorkOS-backed `users` schema.
 */
export class AuthService {
  async getUser(id: string): Promise<User | undefined> {
    return storage.getUser(id);
  }

  /** Legacy name: matches `users.email`. */
  async getUserByUsername(email: string): Promise<User | undefined> {
    return storage.getUserByUsername(email);
  }

  async createUser(data: UpsertUser): Promise<User> {
    return storage.createUser(data);
  }

  async getRole(id: string): Promise<Role | undefined> {
    return storage.getRole(id);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    return storage.getRoleByName(name);
  }

  async createRole(data: InsertRole): Promise<Role> {
    return storage.createRole(data);
  }

  async validateCredentials(_username: string, _password: string): Promise<User | null> {
    return null;
  }

  async getUserWithRole(userId: string): Promise<{ user: User; role?: Role } | null> {
    const user = await storage.getUser(userId);
    if (!user) return null;
    return { user };
  }

  hasPermission(role: Role | undefined, permission: string): boolean {
    if (!role || !role.permissions) return false;
    return role.permissions.includes(permission) || role.permissions.includes("*");
  }
}

export const authService = new AuthService();
