/**
 * Users API Client
 *
 * API functions for user management and search operations.
 */

import { api } from '../api';

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface SearchUsersParams {
  q?: string;
  limit?: number;
}

// API Functions

/**
 * Search registered users by name or email
 */
export const searchUsers = async (params?: SearchUsersParams): Promise<User[]> => {
  const response = await api.get('/users/search', { params });
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data;
};

/**
 * Update current user profile
 */
export const updateCurrentUser = async (data: {
  full_name?: string;
  email?: string;
}): Promise<User> => {
  const response = await api.put('/users/me', data);
  return response.data;
};

/**
 * Change current user's password
 */
export const changePassword = async (data: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> => {
  const response = await api.put('/users/me/password', data);
  return response.data;
};
