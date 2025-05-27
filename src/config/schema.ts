import { z } from 'zod';

// Environment variables schema
export const envSchema = z.object({
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    GEMINI_FLASH_API_URL: z.string().url('GEMINI_FLASH_API_URL must be a valid URL'),
});

// Company contact info schema
export const companyContactInfoSchema = z.object({
    website: z.string().url('Website must be a valid URL').optional(),
    linkedin: z.string().url('LinkedIn must be a valid URL').optional(),
    facebook: z.string().url('Facebook must be a valid URL').optional(),
    github: z.string().url('GitHub must be a valid URL').optional(),
    email: z.string().email('Email must be a valid email address').optional(),
    phone: z.string().regex(/^\+880\d{10}$/, 'Phone must be a valid Bangladesh number (+880XXXXXXXXXX)').optional(),
    address: z.string().min(1, 'Address is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
});

// Gemini API response schema
export const geminiResponseSchema = z.object({
    candidates: z.array(z.object({
        content: z.object({
            parts: z.array(z.object({
                text: z.string(),
            })),
        }),
    })),
});

// Validation result schema
export const validationResultSchema = z.object({
    isValid: z.boolean(),
    invalidFields: z.array(z.string()),
    reason: z.string(),
});

// Type exports
export type EnvSchema = z.infer<typeof envSchema>;
export type CompanyContactInfo = z.infer<typeof companyContactInfoSchema>;
export type GeminiResponse = z.infer<typeof geminiResponseSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>; 