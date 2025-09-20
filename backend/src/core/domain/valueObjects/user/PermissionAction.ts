import { ValueObject } from '../../base/ValueObject';

export interface PermissionActionProps {
    value: string;
}

/**
 * PermissionAction value object
 * Represents the action that a permission allows
 */
export class PermissionAction extends ValueObject<PermissionActionProps> {
    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 30;
    private static readonly ACTION_REGEX = /^[a-z0-9_-]+(\*)?$/;

    // Standard CRUD actions
    private static readonly CRUD_ACTIONS = [
        'create', 'read', 'update', 'delete', 'list', 'view', 'manage'
    ];

    // Extended actions for specific operations
    private static readonly EXTENDED_ACTIONS = [
        'approve', 'reject', 'publish', 'archive', 'export', 'import',
        'backup', 'restore', 'assign', 'unassign', 'activate', 'deactivate',
        'upload', 'download', 'execute', 'configure', 'monitor'
    ];

    private constructor(props: PermissionActionProps) {
        super(props);
    }

    /**
     * Create permission action from string
     */
    public static create(action: string): PermissionAction {
        if (!action) {
            throw new Error('Permission action cannot be empty');
        }

        const normalizedAction = action.trim().toLowerCase();

        if (normalizedAction.length < this.MIN_LENGTH) {
            throw new Error(`Permission action must be at least ${this.MIN_LENGTH} character long`);
        }

        if (normalizedAction.length > this.MAX_LENGTH) {
            throw new Error(`Permission action cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.ACTION_REGEX.test(normalizedAction)) {
            throw new Error('Permission action can only contain lowercase letters, numbers, underscores, hyphens, and optional wildcard (*)');
        }

        // Validate wildcard usage
        if (normalizedAction.includes('*') && normalizedAction !== '*') {
            throw new Error('Wildcard (*) can only be used as the entire action');
        }

        return new PermissionAction({ value: normalizedAction });
    }

    /**
     * Create wildcard action (allows all actions)
     */
    public static createWildcard(): PermissionAction {
        return new PermissionAction({ value: '*' });
    }

    /**
     * Create CRUD actions
     */
    public static createCrud(): PermissionAction[] {
        return this.CRUD_ACTIONS.map(action => this.create(action));
    }

    /**
     * Get permission action value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Check if this is a wildcard action
     */
    public isWildcard(): boolean {
        return this.props.value === '*';
    }

    /**
     * Check if this is a CRUD action
     */
    public isCrudAction(): boolean {
        return PermissionAction.CRUD_ACTIONS.includes(this.props.value);
    }

    /**
     * Check if this is a read-only action
     */
    public isReadOnlyAction(): boolean {
        const readOnlyActions = ['read', 'view', 'list', 'export', 'download', 'monitor'];
        return readOnlyActions.includes(this.props.value);
    }

    /**
     * Check if this is a write action
     */
    public isWriteAction(): boolean {
        const writeActions = ['create', 'update', 'delete', 'upload', 'import', 'execute'];
        return writeActions.includes(this.props.value);
    }

    /**
     * Check if this is an administrative action
     */
    public isAdministrativeAction(): boolean {
        const adminActions = ['manage', 'configure', 'backup', 'restore', 'activate', 'deactivate'];
        return adminActions.includes(this.props.value);
    }

    /**
     * Check if this is a dangerous action (requires extra permissions)
     */
    public isDangerousAction(): boolean {
        const dangerousActions = ['delete', 'execute', 'backup', 'restore', 'configure'];
        return dangerousActions.includes(this.props.value);
    }

    /**
     * Get display name for the action
     */
    public getDisplayName(): string {
        if (this.props.value === '*') {
            return 'All Actions';
        }

        // Convert action to display format
        const displayName = this.props.value
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());

        return displayName;
    }

    /**
     * Get past tense form of the action
     */
    public getPastTense(): string {
        const pastTenseMap: { [key: string]: string } = {
            'create': 'created',
            'read': 'read',
            'update': 'updated',
            'delete': 'deleted',
            'list': 'listed',
            'view': 'viewed',
            'manage': 'managed',
            'approve': 'approved',
            'reject': 'rejected',
            'publish': 'published',
            'archive': 'archived',
            'export': 'exported',
            'import': 'imported',
            'backup': 'backed up',
            'restore': 'restored',
            'assign': 'assigned',
            'unassign': 'unassigned',
            'activate': 'activated',
            'deactivate': 'deactivated',
            'upload': 'uploaded',
            'download': 'downloaded',
            'execute': 'executed',
            'configure': 'configured',
            'monitor': 'monitored'
        };

        return pastTenseMap[this.props.value] || this.props.value + 'ed';
    }

    /**
     * Get action priority (higher number = more permissions required)
     */
    public getPriority(): number {
        const priorityMap: { [key: string]: number } = {
            '*': 100,           // Wildcard has highest priority
            'manage': 90,       // Full management
            'configure': 85,    // System configuration
            'execute': 80,      // Code execution
            'delete': 75,       // Destructive action
            'backup': 70,       // System backup
            'restore': 70,      // System restore
            'create': 60,       // Create new items
            'update': 50,       // Modify existing items
            'approve': 45,      // Approval actions
            'reject': 45,       // Rejection actions
            'assign': 40,       // Assignment actions
            'unassign': 40,     // Unassignment actions
            'activate': 35,     // Activation
            'deactivate': 35,   // Deactivation
            'upload': 30,       // File upload
            'import': 30,       // Data import
            'export': 25,       // Data export
            'download': 20,     // File download
            'list': 15,         // List items
            'view': 10,         // View items
            'read': 10,         // Read items
            'monitor': 5        // Monitor only
        };

        return priorityMap[this.props.value] || 50; // Default priority
    }

    /**
     * Check if this action implies another action
     */
    public implies(otherAction: PermissionAction): boolean {
        // Wildcard implies all actions
        if (this.isWildcard()) {
            return true;
        }

        // Same action implies itself
        if (this.props.value === otherAction.value) {
            return true;
        }

        // Some actions imply others
        const implications: { [key: string]: string[] } = {
            'manage': ['create', 'read', 'update', 'delete', 'list', 'view'],
            'update': ['read', 'view'],
            'delete': ['read', 'view'],
            'create': ['read', 'view'],
            'list': ['view'],
            'export': ['read', 'view', 'list'],
            'backup': ['read', 'view', 'list'],
            'approve': ['read', 'view'],
            'reject': ['read', 'view'],
            'assign': ['read', 'view'],
            'unassign': ['read', 'view']
        };

        const impliedActions = implications[this.props.value] || [];
        return impliedActions.includes(otherAction.value);
    }

    /**
     * Get HTTP method that corresponds to this action
     */
    public getHttpMethod(): string {
        const methodMap: { [key: string]: string } = {
            'create': 'POST',
            'read': 'GET',
            'update': 'PUT',
            'delete': 'DELETE',
            'list': 'GET',
            'view': 'GET',
            'manage': 'GET',
            'upload': 'POST',
            'download': 'GET',
            'export': 'GET',
            'import': 'POST'
        };

        return methodMap[this.props.value] || 'GET';
    }

    /**
     * Check if permission action is valid
     */
    public isValid(): boolean {
        try {
            PermissionAction.create(this.props.value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }

    /**
     * Get all standard actions
     */
    public static getStandardActions(): string[] {
        return [...this.CRUD_ACTIONS, ...this.EXTENDED_ACTIONS];
    }

    /**
     * Get CRUD actions
     */
    public static getCrudActions(): string[] {
        return [...this.CRUD_ACTIONS];
    }

    /**
     * Get extended actions
     */
    public static getExtendedActions(): string[] {
        return [...this.EXTENDED_ACTIONS];
    }
}