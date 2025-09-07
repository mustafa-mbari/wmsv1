// example.usage.ts
// Example of how to use the audit functionality

import { createAuditedPrisma } from './audit.setup';

// Example usage in your controllers/services
export class UserService {
  private prisma;

  constructor(currentUserId?: number) {
    this.prisma = createAuditedPrisma(currentUserId);
  }

  async createUser(userData: any) {
    // Automatically includes created_by and updated_by
    return await this.prisma.createWithAudit('users', userData);
  }

  async updateUser(id: number, userData: any) {
    // Automatically includes updated_by and updated_at
    return await this.prisma.updateWithAudit('users', { id }, userData);
  }

  async deleteUser(id: number) {
    // Soft delete - sets deleted_at and deleted_by
    return await this.prisma.softDelete('users', { id });
  }

  async restoreUser(id: number) {
    // Restore soft deleted user
    return await this.prisma.restore('users', { id });
  }

  async getActiveUsers() {
    // Get only non-deleted users
    return await this.prisma.findManyActive('users');
  }

  async getDeletedUsers() {
    // Get only soft deleted users
    return await this.prisma.findManyDeleted('users');
  }

  async getAllUsers() {
    // Get all users including deleted ones
    return await this.prisma.findManyWithDeleted('users');
  }
}

// Usage example
async function exampleUsage() {
  const currentUserId = 1; // Get from authentication context
  const userService = new UserService(currentUserId);

  // Create user
  const newUser = await userService.createUser({
    username: 'john_doe',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
  });

  // Update user
  const updatedUser = await userService.updateUser(newUser.id, {
    first_name: 'John Updated',
  });

  // Soft delete
  await userService.deleteUser(newUser.id);

  // Restore
  await userService.restoreUser(newUser.id);
}
