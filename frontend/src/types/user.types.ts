export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role_names?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SelectUser extends User {}

export interface InsertUser {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const insertUserSchema = {
  email: String,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
};