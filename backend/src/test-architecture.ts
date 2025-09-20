/**
 * Test file to verify new architecture compiles correctly
 */
import 'reflect-metadata';
import { Container } from './di/Container';
import { Injectable, Inject } from './di/decorators';
import { BaseEntity, AuditableEntity } from './core/domain/entities/base';
import { BaseController } from './infrastructure/api/controllers/base';
import { Result } from './utils/common/Result';
import { ValidationException, BusinessException } from './core/shared/exceptions';

// Test DI Container
const container = Container.getInstance();

// Test Injectable decorator
@Injectable({ singleton: true })
class TestService {
    getName(): string {
        return 'TestService';
    }
}

// Test Entity
class TestEntity extends AuditableEntity {
    constructor(id?: string) {
        super(id);
    }

    validate(): void {
        // Test validation logic
    }
}

// Test Controller
class TestController extends BaseController {
    async testMethod() {
        try {
            const result = Result.ok({ message: 'Test successful' });
            return this.success(result.getValue());
        } catch (error) {
            return this.handleError(error);
        }
    }
}

// Test Result pattern
function testResult(): Result<string> {
    try {
        return Result.ok('Success');
    } catch (error) {
        return Result.fail('Error occurred');
    }
}

// Test Exceptions
function testExceptions(): void {
    throw new ValidationException('Test validation error');
}

console.log('Architecture test compiled successfully!');
console.log('DI Container:', container.getAllTokens());
console.log('Result test:', testResult().getValue());

export { TestService, TestEntity, TestController };