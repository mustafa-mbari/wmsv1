import { describe, it, expect, beforeEach } from '@jest/globals';
import { User } from '../../../../../../src/core/domain/entities/user/User';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashedpassword',
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  describe('Constructor', () => {
    it('should create a user with valid properties', () => {
      expect(user.getId()).toBe(1);
      expect(user.getUsername()).toBe('testuser');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getFullName()).toBe('Test User');
      expect(user.isActiveUser()).toBe(true);
    });

    it('should throw error for invalid email format', () => {
      expect(() => {
        new User({
          id: 1,
          username: 'testuser',
          email: 'invalid-email',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hashedpassword',
          isActive: true,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }).toThrow('Invalid email format');
    });

    it('should throw error for empty username', () => {
      expect(() => {
        new User({
          id: 1,
          username: '',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hashedpassword',
          isActive: true,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }).toThrow('Username cannot be empty');
    });
  });

  describe('Business Logic', () => {
    it('should update user profile correctly', () => {
      user.updateProfile('John', 'Doe', '+1234567890');

      expect(user.getFullName()).toBe('John Doe');
      expect(user.getPhone()).toBe('+1234567890');
    });

    it('should activate and deactivate user', () => {
      user.deactivate();
      expect(user.isActiveUser()).toBe(false);

      user.activate();
      expect(user.isActiveUser()).toBe(true);
    });

    it('should verify email', () => {
      expect(user.isEmailVerified()).toBe(false);

      user.verifyEmail();
      expect(user.isEmailVerified()).toBe(true);
    });

    it('should change password with valid input', () => {
      const oldHash = user.getPasswordHash();
      user.changePassword('newhashedpassword');

      expect(user.getPasswordHash()).toBe('newhashedpassword');
      expect(user.getPasswordHash()).not.toBe(oldHash);
    });

    it('should throw error when changing to empty password', () => {
      expect(() => {
        user.changePassword('');
      }).toThrow('Password hash cannot be empty');
    });
  });

  describe('Domain Events', () => {
    it('should record user created event', () => {
      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('UserCreated');
    });

    it('should record user updated event when profile is updated', () => {
      user.clearEvents(); // Clear creation event
      user.updateProfile('Updated', 'Name');

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('UserUpdated');
    });
  });

  describe('Validation', () => {
    it('should validate email format', () => {
      expect(user.isValidEmail('test@example.com')).toBe(true);
      expect(user.isValidEmail('invalid-email')).toBe(false);
      expect(user.isValidEmail('')).toBe(false);
    });

    it('should validate username format', () => {
      expect(user.isValidUsername('validuser')).toBe(true);
      expect(user.isValidUsername('valid_user123')).toBe(true);
      expect(user.isValidUsername('')).toBe(false);
      expect(user.isValidUsername('a')).toBe(false); // too short
      expect(user.isValidUsername('a'.repeat(51))).toBe(false); // too long
    });
  });
});