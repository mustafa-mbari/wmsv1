import { AuditableEntity } from '../base/AuditableEntity';
import { EntityId } from '../../valueObjects/common/EntityId';
import { Email } from '../../valueObjects/user/Email';
import { Username } from '../../valueObjects/user/Username';
import { UserProfile } from '../../valueObjects/user/UserProfile';
import { Password } from '../../valueObjects/user/Password';
import { IDomainEvent } from '../../events/IDomainEvent';
import { UserCreatedEvent } from '../../events/user/UserCreatedEvent';
import { UserUpdatedEvent } from '../../events/user/UserUpdatedEvent';
import { UserDeactivatedEvent } from '../../events/user/UserDeactivatedEvent';

export interface UserProps {
    id: EntityId;
    username: Username;
    email: Email;
    profile: UserProfile;
    passwordHash: string;
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerifiedAt?: Date;
    lastLoginAt?: Date;
    resetToken?: string;
    resetTokenExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: EntityId;
    updatedBy?: EntityId;
    deletedAt?: Date;
    deletedBy?: EntityId;
}

/**
 * User domain entity
 * Represents a user in the system with authentication and profile information
 */
export class User extends AuditableEntity {
    private readonly _username: Username;
    private readonly _email: Email;
    private _profile: UserProfile;
    private _passwordHash: string;
    private _isActive: boolean;
    private _isEmailVerified: boolean;
    private _emailVerifiedAt?: Date;
    private _lastLoginAt?: Date;
    private _resetToken?: string;
    private _resetTokenExpiresAt?: Date;

    private constructor(props: UserProps) {
        super({
            id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            createdBy: props.createdBy,
            updatedBy: props.updatedBy,
            deletedAt: props.deletedAt,
            deletedBy: props.deletedBy
        });

        this._username = props.username;
        this._email = props.email;
        this._profile = props.profile;
        this._passwordHash = props.passwordHash;
        this._isActive = props.isActive;
        this._isEmailVerified = props.isEmailVerified;
        this._emailVerifiedAt = props.emailVerifiedAt;
        this._lastLoginAt = props.lastLoginAt;
        this._resetToken = props.resetToken;
        this._resetTokenExpiresAt = props.resetTokenExpiresAt;
    }

    /**
     * Create a new user
     */
    public static create(
        username: Username,
        email: Email,
        profile: UserProfile,
        password: Password,
        createdBy?: EntityId
    ): User {
        const id = EntityId.create();
        const now = new Date();

        const user = new User({
            id,
            username,
            email,
            profile,
            passwordHash: password.hashedValue,
            isActive: true,
            isEmailVerified: false,
            createdAt: now,
            updatedAt: now,
            createdBy
        });

        // Add domain event
        user.addDomainEvent(new UserCreatedEvent(id, username, email));

        return user;
    }

    /**
     * Reconstitute user from persistence
     */
    public static reconstitute(props: UserProps): User {
        return new User(props);
    }

    // Getters
    get username(): Username {
        return this._username;
    }

    get email(): Email {
        return this._email;
    }

    get profile(): UserProfile {
        return this._profile;
    }

    get passwordHash(): string {
        return this._passwordHash;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get isEmailVerified(): boolean {
        return this._isEmailVerified;
    }

    get emailVerifiedAt(): Date | undefined {
        return this._emailVerifiedAt;
    }

    get lastLoginAt(): Date | undefined {
        return this._lastLoginAt;
    }

    get resetToken(): string | undefined {
        return this._resetToken;
    }

    get resetTokenExpiresAt(): Date | undefined {
        return this._resetTokenExpiresAt;
    }

    // Business methods

    /**
     * Update user profile
     */
    public updateProfile(profile: UserProfile, updatedBy?: EntityId): void {
        const oldProfile = this._profile;
        this._profile = profile;
        this.touch(updatedBy);

        this.addDomainEvent(new UserUpdatedEvent(this.id, { profile: { old: oldProfile, new: profile } }));
    }

    /**
     * Change password
     */
    public changePassword(newPassword: Password, updatedBy?: EntityId): void {
        this._passwordHash = newPassword.hashedValue;
        this.touch(updatedBy);

        this.addDomainEvent(new UserUpdatedEvent(this.id, { password: { changed: true } }));
    }

    /**
     * Activate user account
     */
    public activate(updatedBy?: EntityId): void {
        if (this._isActive) {
            return; // Already active
        }

        this._isActive = true;
        this.touch(updatedBy);

        this.addDomainEvent(new UserUpdatedEvent(this.id, { status: { old: 'inactive', new: 'active' } }));
    }

    /**
     * Deactivate user account
     */
    public deactivate(updatedBy?: EntityId): void {
        if (!this._isActive) {
            return; // Already inactive
        }

        this._isActive = false;
        this.touch(updatedBy);

        this.addDomainEvent(new UserDeactivatedEvent(this.id, this._username, this._email));
    }

    /**
     * Verify email address
     */
    public verifyEmail(updatedBy?: EntityId): void {
        if (this._isEmailVerified) {
            return; // Already verified
        }

        this._isEmailVerified = true;
        this._emailVerifiedAt = new Date();
        this.touch(updatedBy);

        this.addDomainEvent(new UserUpdatedEvent(this.id, { emailVerified: true }));
    }

    /**
     * Record user login
     */
    public recordLogin(): void {
        this._lastLoginAt = new Date();
        this.touch();
    }

    /**
     * Set password reset token
     */
    public setResetToken(token: string, expiresAt: Date, updatedBy?: EntityId): void {
        this._resetToken = token;
        this._resetTokenExpiresAt = expiresAt;
        this.touch(updatedBy);
    }

    /**
     * Clear password reset token
     */
    public clearResetToken(updatedBy?: EntityId): void {
        this._resetToken = undefined;
        this._resetTokenExpiresAt = undefined;
        this.touch(updatedBy);
    }

    /**
     * Check if reset token is valid
     */
    public isResetTokenValid(token: string): boolean {
        if (!this._resetToken || !this._resetTokenExpiresAt) {
            return false;
        }

        return this._resetToken === token && new Date() < this._resetTokenExpiresAt;
    }

    /**
     * Validate business rules
     */
    public validate(): void {
        if (!this._username.isValid()) {
            throw new Error('Invalid username');
        }

        if (!this._email.isValid()) {
            throw new Error('Invalid email');
        }

        if (!this._profile.isValid()) {
            throw new Error('Invalid user profile');
        }
    }

    /**
     * Check if user can perform administrative actions
     */
    public canPerformAdminActions(): boolean {
        return this._isActive && this._isEmailVerified;
    }

    /**
     * Get display name
     */
    public getDisplayName(): string {
        return this._profile.getDisplayName();
    }

    /**
     * Get full name
     */
    public getFullName(): string {
        return this._profile.getFullName();
    }

    /**
     * Export to plain object for persistence
     */
    public toPersistence(): any {
        return {
            id: this.id.value,
            username: this._username.value,
            email: this._email.value,
            first_name: this._profile.firstName,
            last_name: this._profile.lastName,
            phone: this._profile.phone,
            address: this._profile.address,
            birth_date: this._profile.birthDate,
            gender: this._profile.gender,
            avatar_url: this._profile.avatarUrl,
            language: this._profile.language,
            time_zone: this._profile.timeZone,
            password_hash: this._passwordHash,
            is_active: this._isActive,
            email_verified: this._isEmailVerified,
            email_verified_at: this._emailVerifiedAt,
            last_login_at: this._lastLoginAt,
            reset_token: this._resetToken,
            reset_token_expires_at: this._resetTokenExpiresAt,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            created_by: this.createdBy?.value,
            updated_by: this.updatedBy?.value,
            deleted_at: this.deletedAt,
            deleted_by: this.deletedBy?.value
        };
    }
}