import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long');

export const gradeLevelSchema = z
  .number()
  .int()
  .min(0, 'Grade level must be at least 0 (Kindergarten)')
  .max(12, 'Grade level cannot exceed 12');

export const studentNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

export const sessionModeSchema = z.enum(['PRACTICE', 'HELP', 'ASSESSMENT', 'PROJECT']);

export const difficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const messageContentSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message is too long');

export function validateEmail(email) {
  try {
    emailSchema.parse(email);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.errors[0].message };
  }
}

export function validatePassword(password) {
  try {
    passwordSchema.parse(password);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.errors[0].message };
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}
