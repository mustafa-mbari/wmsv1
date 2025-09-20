import { Product } from '../../domain/entities/product/Product';

export interface ProductDto {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    categoryId: string;
    price: {
        amount: number;
        currency: string;
        formatted: string;
    };
    cost: {
        amount: number;
        currency: string;
        formatted: string;
    };
    stockQuantity: number;
    reorderLevel: number;
    maxStockLevel: number;
    weight?: {
        value: number;
        unit: string;
        formatted: string;
    };
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
        formatted: string;
        volume: number;
    };
    status: {
        value: string;
        displayValue: string;
        color: string;
        icon: string;
        isActive: boolean;
        isAvailableForSale: boolean;
    };
    tags: string[];
    images: string[];
    specifications: Record<string, any>;
    profitMargin: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
    canBeOrdered: boolean;
    shippingCategory?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}

export class ProductMapper {
    static toDto(product: Product): ProductDto {
        return {
            id: product.id.value,
            name: product.name.value,
            sku: product.sku.value,
            barcode: product.barcode,
            description: product.description?.value,
            categoryId: product.categoryId.value,
            price: {
                amount: product.price.amount,
                currency: product.price.currency,
                formatted: product.price.format()
            },
            cost: {
                amount: product.cost.amount,
                currency: product.cost.currency,
                formatted: product.cost.format()
            },
            stockQuantity: product.stockQuantity,
            reorderLevel: product.reorderLevel,
            maxStockLevel: product.maxStockLevel,
            weight: product.weight ? {
                value: product.weight.value,
                unit: product.weight.unit,
                formatted: product.weight.format()
            } : undefined,
            dimensions: product.dimensions ? {
                length: product.dimensions.length,
                width: product.dimensions.width,
                height: product.dimensions.height,
                unit: product.dimensions.unit,
                formatted: product.dimensions.format(),
                volume: product.dimensions.getVolume()
            } : undefined,
            status: {
                value: product.status.value,
                displayValue: product.status.getDisplayValue(),
                color: product.status.getColor(),
                icon: product.status.getIcon(),
                isActive: product.status.isActive(),
                isAvailableForSale: product.status.isAvailableForSale()
            },
            tags: product.tags,
            images: product.images,
            specifications: product.specifications,
            profitMargin: product.getProfitMargin(),
            isLowStock: product.isLowStock(),
            isOutOfStock: product.isOutOfStock(),
            canBeOrdered: product.canBeOrdered(),
            shippingCategory: product.dimensions?.getShippingCategory(),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            createdBy: product.createdBy?.value,
            updatedBy: product.updatedBy?.value,
            deletedAt: product.deletedAt,
            deletedBy: product.deletedBy?.value
        };
    }

    static toDtoList(products: Product[]): ProductDto[] {
        return products.map(product => this.toDto(product));
    }
}