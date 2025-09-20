import { IRepository } from '../../../shared/types/domain.types';
import { EntityId, PaginationParams, PaginationResult, BaseFilter } from '../../../shared/types/common.types';

/**
 * Base repository interface with common operations
 */
export interface IBaseRepository<T, ID = EntityId, TFilter extends BaseFilter = BaseFilter>
    extends IRepository<T, ID> {

    /**
     * Find all entities with optional filtering and pagination
     */
    findAll(
        filter?: TFilter,
        pagination?: PaginationParams
    ): Promise<PaginationResult<T>>;

    /**
     * Find entities by multiple IDs
     */
    findByIds(ids: ID[]): Promise<T[]>;

    /**
     * Check if entity exists by ID
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Count total entities with optional filter
     */
    count(filter?: TFilter): Promise<number>;

    /**
     * Save multiple entities in batch
     */
    saveMany(entities: T[]): Promise<void>;

    /**
     * Update multiple entities in batch
     */
    updateMany(entities: T[]): Promise<void>;

    /**
     * Delete multiple entities by IDs
     */
    deleteMany(ids: ID[]): Promise<void>;

    /**
     * Soft delete (if supported by entity)
     */
    softDelete?(id: ID): Promise<void>;

    /**
     * Restore soft deleted entity (if supported)
     */
    restore?(id: ID): Promise<void>;

    /**
     * Find with custom query
     */
    findWithQuery?(query: any): Promise<T[]>;
}