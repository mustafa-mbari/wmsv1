import { Result } from '../../../utils/common/Result';
import { IDomainContext } from './IContext';

/**
 * Base use case interface
 */
export interface IUseCase<TRequest, TResponse> {
    execute(request: TRequest, context?: IDomainContext): Promise<Result<TResponse>>;
}

/**
 * Use case with no request data
 */
export interface IQueryUseCase<TResponse> {
    execute(context?: IDomainContext): Promise<Result<TResponse>>;
}

/**
 * Use case with no response data (commands)
 */
export interface ICommandUseCase<TRequest> {
    execute(request: TRequest, context?: IDomainContext): Promise<Result<void>>;
}

/**
 * Use case base class with common functionality
 */
export abstract class BaseUseCase<TRequest, TResponse> implements IUseCase<TRequest, TResponse> {
    protected context?: IDomainContext;

    public async execute(request: TRequest, context?: IDomainContext): Promise<Result<TResponse>> {
        this.context = context;

        try {
            // Validate input
            const validationResult = await this.validateInput(request);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Execute business logic
            const result = await this.executeImpl(request);

            // Post-execution hook
            await this.afterExecution(request, result);

            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Implement the actual business logic
     */
    protected abstract executeImpl(request: TRequest): Promise<Result<TResponse>>;

    /**
     * Validate input data (override if needed)
     */
    protected async validateInput(request: TRequest): Promise<Result<void>> {
        return Result.ok();
    }

    /**
     * Hook called after successful execution (override if needed)
     */
    protected async afterExecution(request: TRequest, result: Result<TResponse>): Promise<void> {
        // Override in derived classes if needed
    }

    /**
     * Handle errors (override if needed)
     */
    protected handleError(error: any): Result<TResponse> {
        console.error('Use case execution error:', error);

        if (error.name === 'ValidationException' ||
            error.name === 'BusinessException' ||
            error.name === 'NotFoundException') {
            return Result.fail(error.message, error.code);
        }

        return Result.fail('An unexpected error occurred', 'INTERNAL_ERROR');
    }

    /**
     * Get current user ID from context
     */
    protected getCurrentUserId(): number | undefined {
        return this.context?.currentUserId;
    }

    /**
     * Check if user is authenticated
     */
    protected isAuthenticated(): boolean {
        return this.getCurrentUserId() !== undefined;
    }
}