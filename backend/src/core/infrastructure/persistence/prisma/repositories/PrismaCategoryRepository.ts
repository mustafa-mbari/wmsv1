import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { ICategoryRepository } from '../../../../domain/repositories/ICategoryRepository';
import { EntityId } from '../../../../domain/base/EntityId';

@injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async exists(id: EntityId): Promise<boolean> {
        const count = await this.prisma.categories.count({
            where: {
                category_id: id.value,
                deleted_at: null
            }
        });
        return count > 0;
    }

    async findById(id: EntityId): Promise<any | null> {
        const category = await this.prisma.categories.findFirst({
            where: {
                category_id: id.value,
                deleted_at: null
            }
        });

        return category;
    }
}