import { Inventory } from '../entities/inventory/Inventory';
import { EntityId } from '../base/EntityId';
import { InventoryStatus } from '../valueObjects/inventory/InventoryStatus';
import { QualityStatus } from '../valueObjects/inventory/QualityStatus';
import { LotNumber } from '../valueObjects/inventory/LotNumber';
import { SerialNumber } from '../valueObjects/inventory/SerialNumber';

export interface InventorySearchFilters {
    productId?: EntityId;
    locationId?: EntityId;
    status?: InventoryStatus;
    qualityStatus?: QualityStatus;
    isActive?: boolean;
    lotNumber?: LotNumber;
    serialNumber?: SerialNumber;
    minQuantity?: number;
    maxQuantity?: number;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    isExpired?: boolean;
    expiringInDays?: number;
    barcode?: string;
    rfidTag?: string;
}

export interface InventorySearchOptions {
    sortBy?: 'quantity' | 'status' | 'location' | 'expiryDate' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export interface InventorySearchResult {
    inventories: Inventory[];
    total: number;
    hasMore: boolean;
}

export interface IInventoryRepository {
    findById(id: EntityId): Promise<Inventory | null>;
    findByProductId(productId: EntityId, options?: InventorySearchOptions): Promise<InventorySearchResult>;
    findByLocationId(locationId: EntityId, options?: InventorySearchOptions): Promise<InventorySearchResult>;
    findByLotNumber(lotNumber: LotNumber): Promise<Inventory[]>;
    findBySerialNumber(serialNumber: SerialNumber): Promise<Inventory | null>;
    findByBarcode(barcode: string): Promise<Inventory | null>;
    findByRfidTag(rfidTag: string): Promise<Inventory | null>;
    search(filters: InventorySearchFilters, options?: InventorySearchOptions): Promise<InventorySearchResult>;
    findAll(options?: InventorySearchOptions): Promise<InventorySearchResult>;
    findLowStockInventory(options?: InventorySearchOptions): Promise<InventorySearchResult>;
    findOutOfStockInventory(options?: InventorySearchOptions): Promise<InventorySearchResult>;
    findExpiredInventory(options?: InventorySearchOptions): Promise<InventorySearchResult>;
    findExpiringInventory(days: number, options?: InventorySearchOptions): Promise<InventorySearchResult>;
    save(inventory: Inventory): Promise<Inventory>;
    update(inventory: Inventory): Promise<Inventory>;
    delete(id: EntityId): Promise<void>;
    exists(id: EntityId): Promise<boolean>;
    existsBySerialNumber(serialNumber: SerialNumber): Promise<boolean>;
    existsByBarcode(barcode: string): Promise<boolean>;
    existsByRfidTag(rfidTag: string): Promise<boolean>;
    count(filters?: InventorySearchFilters): Promise<number>;
    getTotalQuantityByProduct(productId: EntityId): Promise<number>;
    getAvailableQuantityByProduct(productId: EntityId): Promise<number>;
    bulkUpdate(inventories: Inventory[]): Promise<Inventory[]>;
    validateBusinessRules(inventory: Inventory): Promise<string[]>;
}