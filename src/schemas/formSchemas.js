import { z } from 'zod';

export const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50).trim(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50).trim(),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
    country: z.string().min(1, 'Please select a country'),
    terms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the Terms & Conditions' }),
    }),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

export const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50).trim(),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
});
