// audit.setup.ts
// Setup file for implementing audit functionality

import { PrismaClient } from '@prisma/client';

// Extend Prisma Client with audit functionality
class AuditedPrismaClient extends PrismaClient {
  private currentUserId?: number;

  constructor(userId?: number) {
    super();
    this.currentUserId = userId;
  }

  // Set current user for audit tracking
  setCurrentUser(userId: number) {
    this.currentUserId = userId;
    return this;
  }

  // Override create methods to include audit fields
  async createWithAudit<T extends keyof PrismaClient>(
    model: T,
    data: any
  ): Promise<any> {
    const auditData = {
      ...data,
      created_by: this.currentUserId,
      updated_by: this.currentUserId,
    };

    return (this[model] as any).create({ data: auditData });
  }

  // Override update methods to include audit fields
  async updateWithAudit<T extends keyof PrismaClient>(
    model: T,
    where: any,
    data: any
  ): Promise<any> {
    const auditData = {
      ...data,
      updated_by: this.currentUserId,
      updated_at: new Date(),
    };

    return (this[model] as any).update({ where, data: auditData });
  }

  // Soft delete method
  async softDelete<T extends keyof PrismaClient>(
    model: T,
    where: any
  ): Promise<any> {
    return (this[model] as any).update({
      where,
      data: {
        deleted_at: new Date(),
        deleted_by: this.currentUserId,
      },
    });
  }

  // Restore soft deleted record
  async restore<T extends keyof PrismaClient>(
    model: T,
    where: any
  ): Promise<any> {
    return (this[model] as any).update({
      where,
      data: {
        deleted_at: null,
        deleted_by: null,
        updated_by: this.currentUserId,
        updated_at: new Date(),
      },
    });
  }

  // Find with deleted records
  async findManyWithDeleted<T extends keyof PrismaClient>(
    model: T,
    args?: any
  ): Promise<any[]> {
    return (this[model] as any).findMany(args);
  }

  // Find only deleted records
  async findManyDeleted<T extends keyof PrismaClient>(
    model: T,
    args?: any
  ): Promise<any[]> {
    const whereClause = {
      ...args?.where,
      deleted_at: { not: null },
    };

    return (this[model] as any).findMany({
      ...args,
      where: whereClause,
    });
  }

  // Find only active (non-deleted) records
  async findManyActive<T extends keyof PrismaClient>(
    model: T,
    args?: any
  ): Promise<any[]> {
    const whereClause = {
      ...args?.where,
      deleted_at: null,
    };

    return (this[model] as any).findMany({
      ...args,
      where: whereClause,
    });
  }
}

// Export singleton instance
export const createAuditedPrisma = (userId?: number) => {
  return new AuditedPrismaClient(userId);
};

export { AuditedPrismaClient };
