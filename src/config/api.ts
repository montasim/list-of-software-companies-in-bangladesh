import { envSchema } from './schema';

// API Configuration
export const GEMINI_FLASH_API_URL = process.env.GEMINI_FLASH_API_URL;

/**
 * Get the Gemini API key from environment variables
 * @throws Error if GEMINI_API_KEY is not set or invalid
 */
export async function getGeminiApiKey(): Promise<string> {
    try {
        const env = envSchema.parse({
            GEMINI_API_KEY: process.env.GEMINI_API_KEY,
            GEMINI_FLASH_API_URL: process.env.GEMINI_FLASH_API_URL,
        });
        
        return env.GEMINI_API_KEY;
    } catch (error) {
        throw new Error(
            'Environment variables validation failed:\n' +
            'Please ensure your .env file contains:\n' +
            '1. GEMINI_API_KEY=your_api_key_here\n' +
            '2. GEMINI_FLASH_API_URL=valid_api_url\n' +
            '\nValidation error: ' + error
        );
    }
} 