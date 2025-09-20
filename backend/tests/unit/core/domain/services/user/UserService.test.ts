import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UserService } from '../../../../../../src/core/domain/services/user/UserService';
import { IUserRepository } from '../../../../../../src/core/domain/repositories/user/IUserRepository';
import { User } from '../../../../../../src/core/domain/entities/user/User';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    userService = new UserService(mockUserRepository);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      const createdUser = new User({
        id: 1,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: 'hashedpassword',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await userService.createUser(userData);

      expect(result).toBe(createdUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'existing@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      const existingUser = new User({
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
        passwordHash: 'hashedpassword',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(userService.createUser(userData)).rejects.toThrow('Email already exists');
    });

    it('should throw error if username already exists', async () => {
      const userData = {
        username: 'existinguser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      const existingUser = new User({
        id: 1,
        username: 'existinguser',
        email: 'other@example.com',
        firstName: 'Existing',
        lastName: 'User',
        passwordHash: 'hashedpassword',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(existingUser);

      await expect(userService.createUser(userData)).rejects.toThrow('Username already exists');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userId = 1;
      const user = new User({
        id: userId,
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

      mockUserRepository.findById.mockResolvedValue(user);

      const result = await userService.getUserById(userId);

      expect(result).toBe(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user not found', async () => {
      const userId = 999;
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1234567890'
      };

      const existingUser = new User({
        id: userId,
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

      const updatedUser = new User({
        ...existingUser,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone
      });

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(result).toBe(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 1;
      const user = new User({
        id: userId,
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

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser(userId);

      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user not found', async () => {
      const userId = 999;
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser(userId)).rejects.toThrow('User not found');
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const users = [
        new User({
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          passwordHash: 'hash1',
          isActive: true,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        new User({
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          passwordHash: 'hash2',
          isActive: true,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ];

      mockUserRepository.findAll.mockResolvedValue(users);

      const result = await userService.getAllUsers({ page: 1, limit: 10 });

      expect(result).toBe(users);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });
});