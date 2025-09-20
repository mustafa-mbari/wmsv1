import { EntityId } from '../base/EntityId';

export interface ICategoryRepository {
    exists(id: EntityId): Promise<boolean>;
    findById(id: EntityId): Promise<any | null>;
}