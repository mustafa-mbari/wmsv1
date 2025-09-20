import { AuditableEntity } from '../../base/AuditableEntity';
import { EntityId } from '../../valueObjects/common/EntityId';
import { ProductName } from '../../valueObjects/product/ProductName';
import { ProductSku } from '../../valueObjects/product/ProductSku';
import { ProductDescription } from '../../valueObjects/product/ProductDescription';
import { Money } from '../../valueObjects/common/Money';
import { Weight } from '../../valueObjects/common/Weight';
import { Dimensions } from '../../valueObjects/common/Dimensions';
import { ProductStatus } from '../../valueObjects/product/ProductStatus';
import { IDomainEvent } from '../../events/IDomainEvent';
import { ProductCreatedEvent } from '../../events/product/ProductCreatedEvent';
import { ProductUpdatedEvent } from '../../events/product/ProductUpdatedEvent';
import { ProductStatusChangedEvent } from '../../events/product/ProductStatusChangedEvent';

export interface ProductProps {
    id: EntityId;
    name: ProductName;
    sku: ProductSku;
    barcode?: string;
    description?: ProductDescription;
    shortDescription?: string;
    categoryId?: EntityId;
    familyId?: EntityId;
    brandId?: EntityId;
    unitId?: EntityId;
    price: Money;
    cost: Money;
    stockQuantity: number;
    minStockLevel: number;
    weight?: Weight;
    dimensions?: Dimensions;
    status: ProductStatus;
    isDigital: boolean;
    trackStock: boolean;
    imageUrl?: string;
    images?: string[];
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy?: EntityId;
    updatedBy?: EntityId;
    deletedAt?: Date;
    deletedBy?: EntityId;
}

/**
 * Product domain entity
 * Represents a product in the system with all its attributes and business logic
 */
export class Product extends AuditableEntity {
    private _name: ProductName;
    private _sku: ProductSku;
    private _barcode?: string;
    private _description?: ProductDescription;
    private _shortDescription?: string;
    private _categoryId?: EntityId;
    private _familyId?: EntityId;
    private _brandId?: EntityId;
    private _unitId?: EntityId;
    private _price: Money;
    private _cost: Money;
    private _stockQuantity: number;
    private _minStockLevel: number;
    private _weight?: Weight;
    private _dimensions?: Dimensions;
    private _status: ProductStatus;
    private _isDigital: boolean;
    private _trackStock: boolean;
    private _imageUrl?: string;
    private _images?: string[];
    private _tags?: string[];

    private constructor(props: ProductProps) {
        super({
            id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            createdBy: props.createdBy,
            updatedBy: props.updatedBy,
            deletedAt: props.deletedAt,
            deletedBy: props.deletedBy
        });

        this._name = props.name;
        this._sku = props.sku;
        this._barcode = props.barcode;
        this._description = props.description;
        this._shortDescription = props.shortDescription;
        this._categoryId = props.categoryId;
        this._familyId = props.familyId;
        this._brandId = props.brandId;
        this._unitId = props.unitId;
        this._price = props.price;
        this._cost = props.cost;
        this._stockQuantity = props.stockQuantity;
        this._minStockLevel = props.minStockLevel;
        this._weight = props.weight;
        this._dimensions = props.dimensions;
        this._status = props.status;
        this._isDigital = props.isDigital;
        this._trackStock = props.trackStock;
        this._imageUrl = props.imageUrl;
        this._images = props.images;
        this._tags = props.tags;
    }

    /**
     * Create a new product
     */
    public static create(
        name: ProductName,
        sku: ProductSku,
        price: Money,
        cost: Money,
        options: {
            barcode?: string;
            description?: ProductDescription;
            shortDescription?: string;
            categoryId?: EntityId;
            familyId?: EntityId;
            brandId?: EntityId;
            unitId?: EntityId;
            stockQuantity?: number;
            minStockLevel?: number;
            weight?: Weight;
            dimensions?: Dimensions;
            isDigital?: boolean;
            trackStock?: boolean;
            imageUrl?: string;
            images?: string[];
            tags?: string[];
        } = {},
        createdBy?: EntityId
    ): Product {
        const id = EntityId.create();
        const now = new Date();

        const product = new Product({
            id,
            name,
            sku,
            barcode: options.barcode,
            description: options.description,
            shortDescription: options.shortDescription,
            categoryId: options.categoryId,
            familyId: options.familyId,
            brandId: options.brandId,
            unitId: options.unitId,
            price,
            cost,
            stockQuantity: options.stockQuantity || 0,
            minStockLevel: options.minStockLevel || 0,
            weight: options.weight,
            dimensions: options.dimensions,
            status: ProductStatus.create('active'),
            isDigital: options.isDigital || false,
            trackStock: options.trackStock !== false, // Default to true
            imageUrl: options.imageUrl,
            images: options.images,
            tags: options.tags,
            createdAt: now,
            updatedAt: now,
            createdBy
        });

        // Add domain event
        product.addDomainEvent(new ProductCreatedEvent(id, name, sku, price));

        return product;
    }

    /**
     * Reconstitute product from persistence
     */
    public static reconstitute(props: ProductProps): Product {
        return new Product(props);
    }

    // Getters
    get name(): ProductName {
        return this._name;
    }

    get sku(): ProductSku {
        return this._sku;
    }

    get barcode(): string | undefined {
        return this._barcode;
    }

    get description(): ProductDescription | undefined {
        return this._description;
    }

    get shortDescription(): string | undefined {
        return this._shortDescription;
    }

    get categoryId(): EntityId | undefined {
        return this._categoryId;
    }

    get familyId(): EntityId | undefined {
        return this._familyId;
    }

    get brandId(): EntityId | undefined {
        return this._brandId;
    }

    get unitId(): EntityId | undefined {
        return this._unitId;
    }

    get price(): Money {
        return this._price;
    }

    get cost(): Money {
        return this._cost;
    }

    get stockQuantity(): number {
        return this._stockQuantity;
    }

    get minStockLevel(): number {
        return this._minStockLevel;
    }

    get weight(): Weight | undefined {
        return this._weight;
    }

    get dimensions(): Dimensions | undefined {
        return this._dimensions;
    }

    get status(): ProductStatus {
        return this._status;
    }

    get isDigital(): boolean {
        return this._isDigital;
    }

    get trackStock(): boolean {
        return this._trackStock;
    }

    get imageUrl(): string | undefined {
        return this._imageUrl;
    }

    get images(): string[] | undefined {
        return this._images;
    }

    get tags(): string[] | undefined {
        return this._tags;
    }

    // Business methods

    /**
     * Update product information
     */
    public updateInformation(
        name: ProductName,
        description?: ProductDescription,
        shortDescription?: string,
        updatedBy?: EntityId
    ): void {
        const oldName = this._name;
        this._name = name;
        this._description = description;
        this._shortDescription = shortDescription;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            name: { old: oldName, new: name },
            description: { old: this._description, new: description }
        }));
    }

    /**
     * Update pricing
     */
    public updatePricing(price: Money, cost: Money, updatedBy?: EntityId): void {
        const oldPrice = this._price;
        const oldCost = this._cost;
        this._price = price;
        this._cost = cost;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            pricing: {
                price: { old: oldPrice, new: price },
                cost: { old: oldCost, new: cost }
            }
        }));
    }

    /**
     * Update stock levels
     */
    public updateStockLevels(stockQuantity: number, minStockLevel: number, updatedBy?: EntityId): void {
        if (stockQuantity < 0) {
            throw new Error('Stock quantity cannot be negative');
        }

        if (minStockLevel < 0) {
            throw new Error('Minimum stock level cannot be negative');
        }

        const oldStock = this._stockQuantity;
        const oldMinLevel = this._minStockLevel;
        this._stockQuantity = stockQuantity;
        this._minStockLevel = minStockLevel;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            stock: {
                quantity: { old: oldStock, new: stockQuantity },
                minLevel: { old: oldMinLevel, new: minStockLevel }
            }
        }));
    }

    /**
     * Add stock
     */
    public addStock(quantity: number, updatedBy?: EntityId): void {
        if (quantity <= 0) {
            throw new Error('Quantity to add must be positive');
        }

        if (!this._trackStock) {
            throw new Error('Cannot add stock to a product that does not track stock');
        }

        const oldStock = this._stockQuantity;
        this._stockQuantity += quantity;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            stock: {
                added: quantity,
                oldQuantity: oldStock,
                newQuantity: this._stockQuantity
            }
        }));
    }

    /**
     * Remove stock
     */
    public removeStock(quantity: number, updatedBy?: EntityId): void {
        if (quantity <= 0) {
            throw new Error('Quantity to remove must be positive');
        }

        if (!this._trackStock) {
            throw new Error('Cannot remove stock from a product that does not track stock');
        }

        if (this._stockQuantity < quantity) {
            throw new Error('Insufficient stock quantity');
        }

        const oldStock = this._stockQuantity;
        this._stockQuantity -= quantity;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            stock: {
                removed: quantity,
                oldQuantity: oldStock,
                newQuantity: this._stockQuantity
            }
        }));
    }

    /**
     * Change product status
     */
    public changeStatus(status: ProductStatus, updatedBy?: EntityId): void {
        if (this._status.equals(status)) {
            return; // No change needed
        }

        const oldStatus = this._status;
        this._status = status;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductStatusChangedEvent(this.id, oldStatus, status));
    }

    /**
     * Activate product
     */
    public activate(updatedBy?: EntityId): void {
        this.changeStatus(ProductStatus.create('active'), updatedBy);
    }

    /**
     * Deactivate product
     */
    public deactivate(updatedBy?: EntityId): void {
        this.changeStatus(ProductStatus.create('inactive'), updatedBy);
    }

    /**
     * Discontinue product
     */
    public discontinue(updatedBy?: EntityId): void {
        this.changeStatus(ProductStatus.create('discontinued'), updatedBy);
    }

    /**
     * Update category assignment
     */
    public assignToCategory(categoryId: EntityId, updatedBy?: EntityId): void {
        const oldCategoryId = this._categoryId;
        this._categoryId = categoryId;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            category: { old: oldCategoryId, new: categoryId }
        }));
    }

    /**
     * Remove from category
     */
    public removeFromCategory(updatedBy?: EntityId): void {
        const oldCategoryId = this._categoryId;
        this._categoryId = undefined;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            category: { old: oldCategoryId, new: undefined }
        }));
    }

    /**
     * Update images
     */
    public updateImages(imageUrl?: string, images?: string[], updatedBy?: EntityId): void {
        this._imageUrl = imageUrl;
        this._images = images;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            images: { imageUrl, images }
        }));
    }

    /**
     * Update tags
     */
    public updateTags(tags: string[], updatedBy?: EntityId): void {
        this._tags = tags;
        this.touch(updatedBy);

        this.addDomainEvent(new ProductUpdatedEvent(this.id, {
            tags: { old: this._tags, new: tags }
        }));
    }

    // Business rule checks

    /**
     * Check if product is available for sale
     */
    public isAvailableForSale(): boolean {
        return this._status.isActive() &&
               (!this._trackStock || this._stockQuantity > 0);
    }

    /**
     * Check if product is low in stock
     */
    public isLowInStock(): boolean {
        return this._trackStock &&
               this._stockQuantity <= this._minStockLevel;
    }

    /**
     * Check if product is out of stock
     */
    public isOutOfStock(): boolean {
        return this._trackStock && this._stockQuantity === 0;
    }

    /**
     * Get profit margin
     */
    public getProfitMargin(): number {
        if (this._cost.amount === 0) {
            return 0;
        }
        return ((this._price.amount - this._cost.amount) / this._cost.amount) * 100;
    }

    /**
     * Get profit amount
     */
    public getProfitAmount(): Money {
        return Money.create(
            this._price.amount - this._cost.amount,
            this._price.currency
        );
    }

    /**
     * Calculate stock value
     */
    public getStockValue(): Money {
        return Money.create(
            this._stockQuantity * this._cost.amount,
            this._cost.currency
        );
    }

    /**
     * Validate business rules
     */
    public validate(): void {
        if (!this._name.isValid()) {
            throw new Error('Invalid product name');
        }

        if (!this._sku.isValid()) {
            throw new Error('Invalid product SKU');
        }

        if (!this._price.isValid()) {
            throw new Error('Invalid product price');
        }

        if (!this._cost.isValid()) {
            throw new Error('Invalid product cost');
        }

        if (this._stockQuantity < 0) {
            throw new Error('Stock quantity cannot be negative');
        }

        if (this._minStockLevel < 0) {
            throw new Error('Minimum stock level cannot be negative');
        }
    }

    /**
     * Export to plain object for persistence
     */
    public toPersistence(): any {
        return {
            id: this.id.value,
            name: this._name.value,
            sku: this._sku.value,
            barcode: this._barcode,
            description: this._description?.value,
            short_description: this._shortDescription,
            category_id: this._categoryId?.value,
            family_id: this._familyId?.value,
            brand_id: this._brandId?.value,
            unit_id: this._unitId?.value,
            price: this._price.amount,
            cost: this._cost.amount,
            stock_quantity: this._stockQuantity,
            min_stock_level: this._minStockLevel,
            weight: this._weight?.value,
            length: this._dimensions?.length,
            width: this._dimensions?.width,
            height: this._dimensions?.height,
            status: this._status.value,
            is_digital: this._isDigital,
            track_stock: this._trackStock,
            image_url: this._imageUrl,
            images: this._images ? JSON.stringify(this._images) : null,
            tags: this._tags ? JSON.stringify(this._tags) : null,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            created_by: this.createdBy?.value,
            updated_by: this.updatedBy?.value,
            deleted_at: this.deletedAt,
            deleted_by: this.deletedBy?.value
        };
    }
}