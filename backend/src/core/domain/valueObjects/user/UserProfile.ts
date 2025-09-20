import { ValueObject } from '../../base/ValueObject';

export interface UserProfileProps {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    birthDate?: Date;
    gender?: string;
    avatarUrl?: string;
    language?: string;
    timeZone?: string;
}

/**
 * UserProfile value object
 * Encapsulates user profile information
 */
export class UserProfile extends ValueObject<UserProfileProps> {
    private static readonly PHONE_REGEX = /^\+?[\d\s\-\(\)]{7,20}$/;
    private static readonly SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
    private static readonly GENDER_OPTIONS = ['male', 'female', 'other', 'prefer_not_to_say'];

    private constructor(props: UserProfileProps) {
        super(props);
    }

    /**
     * Create user profile
     */
    public static create(props: UserProfileProps): UserProfile {
        if (!props.firstName?.trim()) {
            throw new Error('First name is required');
        }

        if (!props.lastName?.trim()) {
            throw new Error('Last name is required');
        }

        if (props.firstName.trim().length > 100) {
            throw new Error('First name cannot exceed 100 characters');
        }

        if (props.lastName.trim().length > 100) {
            throw new Error('Last name cannot exceed 100 characters');
        }

        if (props.phone && !this.PHONE_REGEX.test(props.phone)) {
            throw new Error('Invalid phone number format');
        }

        if (props.gender && !this.GENDER_OPTIONS.includes(props.gender.toLowerCase())) {
            throw new Error('Invalid gender option');
        }

        if (props.language && !this.SUPPORTED_LANGUAGES.includes(props.language.toLowerCase())) {
            throw new Error('Unsupported language');
        }

        if (props.birthDate && props.birthDate > new Date()) {
            throw new Error('Birth date cannot be in the future');
        }

        const minBirthDate = new Date();
        minBirthDate.setFullYear(minBirthDate.getFullYear() - 120);
        if (props.birthDate && props.birthDate < minBirthDate) {
            throw new Error('Invalid birth date');
        }

        return new UserProfile({
            firstName: props.firstName.trim(),
            lastName: props.lastName.trim(),
            phone: props.phone?.trim() || undefined,
            address: props.address?.trim() || undefined,
            birthDate: props.birthDate,
            gender: props.gender?.toLowerCase() || undefined,
            avatarUrl: props.avatarUrl?.trim() || undefined,
            language: props.language?.toLowerCase() || 'en',
            timeZone: props.timeZone?.trim() || 'UTC'
        });
    }

    // Getters
    get firstName(): string {
        return this.props.firstName;
    }

    get lastName(): string {
        return this.props.lastName;
    }

    get phone(): string | undefined {
        return this.props.phone;
    }

    get address(): string | undefined {
        return this.props.address;
    }

    get birthDate(): Date | undefined {
        return this.props.birthDate;
    }

    get gender(): string | undefined {
        return this.props.gender;
    }

    get avatarUrl(): string | undefined {
        return this.props.avatarUrl;
    }

    get language(): string {
        return this.props.language || 'en';
    }

    get timeZone(): string {
        return this.props.timeZone || 'UTC';
    }

    /**
     * Get full name
     */
    public getFullName(): string {
        return `${this.props.firstName} ${this.props.lastName}`;
    }

    /**
     * Get display name (first name + last initial)
     */
    public getDisplayName(): string {
        const lastInitial = this.props.lastName.charAt(0).toUpperCase();
        return `${this.props.firstName} ${lastInitial}.`;
    }

    /**
     * Get initials
     */
    public getInitials(): string {
        const firstInitial = this.props.firstName.charAt(0).toUpperCase();
        const lastInitial = this.props.lastName.charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
    }

    /**
     * Calculate age from birth date
     */
    public getAge(): number | undefined {
        if (!this.props.birthDate) {
            return undefined;
        }

        const today = new Date();
        const birthDate = new Date(this.props.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Update profile with new data
     */
    public update(updates: Partial<UserProfileProps>): UserProfile {
        return UserProfile.create({
            ...this.props,
            ...updates
        });
    }

    /**
     * Update avatar URL
     */
    public updateAvatar(avatarUrl: string): UserProfile {
        return UserProfile.create({
            ...this.props,
            avatarUrl: avatarUrl.trim() || undefined
        });
    }

    /**
     * Remove avatar
     */
    public removeAvatar(): UserProfile {
        return UserProfile.create({
            ...this.props,
            avatarUrl: undefined
        });
    }

    /**
     * Validate profile data
     */
    public isValid(): boolean {
        try {
            UserProfile.create(this.props);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if profile is complete
     */
    public isComplete(): boolean {
        return !!(
            this.props.firstName &&
            this.props.lastName &&
            this.props.phone &&
            this.props.address
        );
    }

    /**
     * Get profile completion percentage
     */
    public getCompletionPercentage(): number {
        const fields = ['firstName', 'lastName', 'phone', 'address', 'birthDate', 'gender'];
        const completedFields = fields.filter(field => this.props[field as keyof UserProfileProps]);
        return Math.round((completedFields.length / fields.length) * 100);
    }
}