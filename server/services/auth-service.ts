import { storage } from "../storage";
import type { User, InsertUser, Role, InsertRole } from "@shared/schema";

export class AuthService {
  async getUser(id: string): Promise<User | undefined> {
    return storage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return storage.getUserByUsername(username);
  }

  async createUser(data: InsertUser): Promise<User> {
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

  async validateCredentials(username: string, password: string): Promise<User | null> {
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return user;
  }

  async getUserWithRole(userId: string): Promise<{ user: User; role?: Role } | null> {
    const user = await storage.getUser(userId);
    if (!user) return null;

    let role: Role | undefined;
    if (user.roleId) {
      role = await storage.getRole(user.roleId);
    }

    return { user, role };
  }

  hasPermission(role: Role | undefined, permission: string): boolean {
    if (!role || !role.permissions) return false;
    return role.permissions.includes(permission) || role.permissions.includes("*");
  }
}

export const authService = new AuthService();
