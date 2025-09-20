import { ValueObject } from '../../base/ValueObject';

export interface ProductStatusProps {
    value: string;
}

/**
 * ProductStatus value object
 * Represents the status of a product with business rules
 */
export class ProductStatus extends ValueObject<ProductStatusProps> {
    private static readonly VALID_STATUSES = [
        'active',
        'inactive',
        'discontinued',
        'draft',
        'pending_approval',
        'out_of_stock'
    ] as const;

    public static readonly ACTIVE = 'active';
    public static readonly INACTIVE = 'inactive';
    public static readonly DISCONTINUED = 'discontinued';
    public static readonly DRAFT = 'draft';
    public static readonly PENDING_APPROVAL = 'pending_approval';
    public static readonly OUT_OF_STOCK = 'out_of_stock';

    private constructor(props: ProductStatusProps) {
        super(props);
    }

    /**
     * Create product status from string
     */
    public static create(status: string): ProductStatus {
        if (!status) {
            throw new Error('Product status cannot be empty');
        }

        const normalizedStatus = status.toLowerCase().trim();

        if (!this.VALID_STATUSES.includes(normalizedStatus as any)) {
            throw new Error(`Invalid product status: ${status}. Valid statuses are: ${this.VALID_STATUSES.join(', ')}`);
        }

        return new ProductStatus({ value: normalizedStatus });
    }

    /**
     * Create active status
     */
    public static active(): ProductStatus {
        return new ProductStatus({ value: this.ACTIVE });
    }

    /**
     * Create inactive status
     */
    public static inactive(): ProductStatus {
        return new ProductStatus({ value: this.INACTIVE });
    }

    /**
     * Create discontinued status
     */
    public static discontinued(): ProductStatus {
        return new ProductStatus({ value: this.DISCONTINUED });
    }

    /**
     * Create draft status
     */
    public static draft(): ProductStatus {
        return new ProductStatus({ value: this.DRAFT });
    }

    /**
     * Create pending approval status
     */
    public static pendingApproval(): ProductStatus {
        return new ProductStatus({ value: this.PENDING_APPROVAL });
    }

    /**
     * Create out of stock status
     */
    public static outOfStock(): ProductStatus {
        return new ProductStatus({ value: this.OUT_OF_STOCK });
    }

    /**
     * Get product status value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Get display value (formatted for UI)
     */
    public getDisplayValue(): string {
        return this.props.value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get status color for UI
     */
    public getColor(): string {
        switch (this.props.value) {
            case ProductStatus.ACTIVE:
                return 'green';
            case ProductStatus.INACTIVE:
                return 'gray';
            case ProductStatus.DISCONTINUED:
                return 'red';
            case ProductStatus.DRAFT:
                return 'blue';
            case ProductStatus.PENDING_APPROVAL:
                return 'yellow';
            case ProductStatus.OUT_OF_STOCK:
                return 'orange';
            default:
                return 'gray';
        }
    }

    /**
     * Get status icon for UI
     */
    public getIcon(): string {
        switch (this.props.value) {
            case ProductStatus.ACTIVE:
                return '✅';
            case ProductStatus.INACTIVE:
                return '⏸️';
            case ProductStatus.DISCONTINUED:
                return '🚫';
            case ProductStatus.DRAFT:
                return '📝';
            case ProductStatus.PENDING_APPROVAL:
                return '⏳';
            case ProductStatus.OUT_OF_STOCK:
                return '📦';
            default:
                return '❓';
        }
    }

    /**
     * Check if product is active
     */
    public isActive(): boolean {
        return this.props.value === ProductStatus.ACTIVE;
    }

    /**
     * Check if product is inactive
     */
    public isInactive(): boolean {
        return this.props.value === ProductStatus.INACTIVE;
    }

    /**
     * Check if product is discontinued
     */
    public isDiscontinued(): boolean {
        return this.props.value === ProductStatus.DISCONTINUED;
    }

    /**
     * Check if product is in draft
     */
    public isDraft(): boolean {
        return this.props.value === ProductStatus.DRAFT;
    }

    /**
     * Check if product is pending approval
     */
    public isPendingApproval(): boolean {
        return this.props.value === ProductStatus.PENDING_APPROVAL;
    }

    /**
     * Check if product is out of stock
     */
    public isOutOfStock(): boolean {
        return this.props.value === ProductStatus.OUT_OF_STOCK;
    }

    /**
     * Check if product is available for sale
     */
    public isAvailableForSale(): boolean {
        return this.isActive();
    }

    /**
     * Check if product is visible to customers
     */
    public isVisibleToCustomers(): boolean {
        return this.isActive() || this.isOutOfStock();
    }

    /**
     * Check if product can be edited
     */
    public canBeEdited(): boolean {
        return !this.isDiscontinued();
    }

    /**
     * Check if product can be ordered
     */
    public canBeOrdered(): boolean {
        return this.isActive();
    }

    /**
     * Check if status can transition to another status
     */
    public canTransitionTo(newStatus: ProductStatus): boolean {
        const current = this.props.value;
        const target = newStatus.value;

        // Define allowed transitions
        const allowedTransitions: { [key: string]: string[] } = {
            [ProductStatus.DRAFT]: [
                ProductStatus.PENDING_APPROVAL,
                ProductStatus.ACTIVE,
                ProductStatus.INACTIVE
            ],
            [ProductStatus.PENDING_APPROVAL]: [
                ProductStatus.ACTIVE,
                ProductStatus.INACTIVE,
                ProductStatus.DRAFT
            ],
            [ProductStatus.ACTIVE]: [
                ProductStatus.INACTIVE,
                ProductStatus.DISCONTINUED,
                ProductStatus.OUT_OF_STOCK
            ],
            [ProductStatus.INACTIVE]: [
                ProductStatus.ACTIVE,
                ProductStatus.DISCONTINUED,
                ProductStatus.DRAFT
            ],
            [ProductStatus.OUT_OF_STOCK]: [
                ProductStatus.ACTIVE,
                ProductStatus.INACTIVE,
                ProductStatus.DISCONTINUED
            ],
            [ProductStatus.DISCONTINUED]: [] // Cannot transition from discontinued
        };

        return allowedTransitions[current]?.includes(target) || false;
    }

    /**
     * Get next possible statuses
     */
    public getNextPossibleStatuses(): ProductStatus[] {
        const current = this.props.value;

        const transitions: { [key: string]: string[] } = {
            [ProductStatus.DRAFT]: [
                ProductStatus.PENDING_APPROVAL,
                ProductStatus.ACTIVE,
                ProductStatus.INACTIVE
            ],
            [ProductStatus.PENDING_APPROVAL]: [
                ProductStatus.ACTIVE,
                ProductStatus.INACTIVE,
                ProductStatus.DRAFT
            ],
            [ProductStatus.ACTIVE]: [
                ProductStatus.INACTIVE,
                ProductStatus.DISCONTINUED,
                ProductStatus.OUT_OF_STOCK
            ],
            [ProductStatus.INACTIVE]: [
                ProductStatus.ACTIVE,
                ProductStatus.DISCONTINUED,
                ProductStatus.DRAFT
            ],
            [ProductStatus.OUT_OF_STOCK]: [
                ProductStatus.ACTIVE,
                ProductStatus.INACTIVE,
                ProductStatus.DISCONTINUED
            ],
            [ProductStatus.DISCONTINUED]: []
        };

        return (transitions[current] || []).map(status => ProductStatus.create(status));
    }

    /**
     * Get status priority (for sorting)
     */
    public getPriority(): number {
        const priorities: { [key: string]: number } = {
            [ProductStatus.ACTIVE]: 1,
            [ProductStatus.OUT_OF_STOCK]: 2,
            [ProductStatus.PENDING_APPROVAL]: 3,
            [ProductStatus.DRAFT]: 4,
            [ProductStatus.INACTIVE]: 5,
            [ProductStatus.DISCONTINUED]: 6
        };

        return priorities[this.props.value] || 99;
    }

    /**
     * Check if status requires attention
     */
    public requiresAttention(): boolean {
        return [
            ProductStatus.PENDING_APPROVAL,
            ProductStatus.OUT_OF_STOCK,
            ProductStatus.DRAFT
        ].includes(this.props.value as any);
    }

    /**
     * Get status description
     */
    public getDescription(): string {
        const descriptions: { [key: string]: string } = {
            [ProductStatus.ACTIVE]: 'Product is active and available for sale',
            [ProductStatus.INACTIVE]: 'Product is temporarily unavailable',
            [ProductStatus.DISCONTINUED]: 'Product has been permanently discontinued',
            [ProductStatus.DRAFT]: 'Product is in draft state and not yet published',
            [ProductStatus.PENDING_APPROVAL]: 'Product is waiting for approval',
            [ProductStatus.OUT_OF_STOCK]: 'Product is currently out of stock'
        };

        return descriptions[this.props.value] || 'Unknown status';
    }

    /**
     * Validate status
     */
    public isValid(): boolean {
        return ProductStatus.VALID_STATUSES.includes(this.props.value as any);
    }

    /**
     * Get all valid statuses
     */
    public static getAllValidStatuses(): string[] {
        return [...this.VALID_STATUSES];
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }
}