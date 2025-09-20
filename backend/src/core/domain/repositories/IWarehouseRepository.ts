import { Warehouse } from '../entities/warehouse/Warehouse';
import { EntityId } from '../base/EntityId';
import { WarehouseCode } from '../valueObjects/warehouse/WarehouseCode';
import { WarehouseType } from '../valueObjects/warehouse/WarehouseType';
import { WarehouseStatus } from '../valueObjects/warehouse/WarehouseStatus';

export interface WarehouseSearchFilters {
    name?: string;
    code?: string;
    type?: WarehouseType;
    status?: WarehouseStatus;
    isActive?: boolean;
    country?: string;
    state?: string;
    city?: string;
    temperatureControlled?: boolean;
    hasCoordinates?: boolean;
}

export interface WarehouseSearchOptions {
    sortBy?: 'name' | 'code' | 'type' | 'status' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export interface WarehouseSearchResult {
    warehouses: Warehouse[];
    total: number;
    hasMore: boolean;
}

export interface WarehouseStatistics {
    totalWarehouses: number;
    operationalWarehouses: number;
    inactiveWarehouses: number;
    maintenanceWarehouses: number;
    totalCapacity: number;
    utilizationPercentage: number;
    averageUtilization: number;
    warehousesByType: { [type: string]: number };
    warehousesByStatus: { [status: string]: number };
}

export interface IWarehouseRepository {
    findById(id: EntityId): Promise<Warehouse | null>;

    findByCode(code: WarehouseCode): Promise<Warehouse | null>;

    findByName(name: string): Promise<Warehouse | null>;

    findByType(type: WarehouseType, options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findByStatus(status: WarehouseStatus, options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findByLocation(country: string, state?: string, city?: string, options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findNearLocation(latitude: number, longitude: number, radiusKm: number, options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    search(filters: WarehouseSearchFilters, options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findAll(options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findOperational(options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findActive(options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findWithTemperatureControl(options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findRequiringMaintenance(options?: WarehouseSearchOptions): Promise<WarehouseSearchResult>;

    findByIds(ids: EntityId[]): Promise<Warehouse[]>;

    save(warehouse: Warehouse): Promise<Warehouse>;

    update(warehouse: Warehouse): Promise<Warehouse>;

    delete(id: EntityId): Promise<void>;

    exists(id: EntityId): Promise<boolean>;

    existsByCode(code: WarehouseCode): Promise<boolean>;

    existsByName(name: string): Promise<boolean>;

    count(filters?: WarehouseSearchFilters): Promise<number>;

    getStatistics(): Promise<WarehouseStatistics>;

    getCapacityUtilization(warehouseId: EntityId): Promise<number>;

    getDistanceBetween(warehouseId1: EntityId, warehouseId2: EntityId): Promise<number | null>;

    findClosestWarehouses(latitude: number, longitude: number, limit?: number): Promise<{
        warehouse: Warehouse;
        distance: number;
    }[]>;

    bulkUpdate(warehouses: Warehouse[]): Promise<Warehouse[]>;

    bulkUpdateStatus(warehouseIds: EntityId[], status: WarehouseStatus): Promise<void>;

    validateBusinessRules(warehouse: Warehouse): Promise<string[]>;

    getWarehouseHierarchy(): Promise<{
        warehouse: Warehouse;
        zones: number;
        aisles: number;
        racks: number;
        levels: number;
        bins: number;
    }[]>;

    findUnderutilized(thresholdPercentage: number): Promise<Warehouse[]>;

    findOverutilized(thresholdPercentage: number): Promise<Warehouse[]>;

    getRegionalDistribution(): Promise<{ [region: string]: number }>;

    findByOperatingHours(currentTime: Date): Promise<Warehouse[]>;

    getMaintenanceSchedule(dateRange: { from: Date; to: Date }): Promise<{
        warehouse: Warehouse;
        maintenanceType: string;
        scheduledDate: Date;
        estimatedDuration: number;
    }[]>;
}