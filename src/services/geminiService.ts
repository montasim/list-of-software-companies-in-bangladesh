import fetch from 'node-fetch';
import status from 'http-status-lite';
import { CompanyContactInfo, GeminiResponse, ValidationResult, companyContactInfoSchema, geminiResponseSchema, validationResultSchema } from '../types/company';
import { GEMINI_FLASH_API_URL, getGeminiApiKey } from '../config/api';

// Maximum number of retries
const MAX_RETRIES = 5;
// Base delay in milliseconds
const BASE_DELAY = 6000;
// Maximum number of refetch attempts
const MAX_REFETCH = 3;

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeGeminiRequest(url: string | undefined = GEMINI_FLASH_API_URL, body: any, retryCount = 0): Promise<GeminiResponse> {
    if (!url) {
        throw new Error('GEMINI_FLASH_API_URL is not set');
    }

    try {
        const apiKey = await getGeminiApiKey();
        const response = await fetch(`${url}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // Check for rate limit error
            if (response.status === status.TOO_MANY_REQUESTS && retryCount < MAX_RETRIES) {
                const retryDelay = BASE_DELAY * Math.pow(2, retryCount);
                console.log(`Rate limit hit (429 Too Many Requests). Retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
                await sleep(retryDelay);
                return makeGeminiRequest(url, body, retryCount + 1);
            }

            // Handle other common HTTP errors
            switch (response.status) {
                case status.BAD_REQUEST:
                    throw new Error(`Invalid request: ${JSON.stringify(errorData)}`);
                case status.UNAUTHORIZED:
                    throw new Error('Invalid API key');
                case status.FORBIDDEN:
                    throw new Error('API key does not have permission to access this resource');
                case status.NOT_FOUND:
                    throw new Error('API endpoint not found');
                case status.INTERNAL_SERVER_ERROR:
                    throw new Error('Gemini API server error');
                default:
                    throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
            }
        }

        const data = await response.json();
        return geminiResponseSchema.parse(data);
    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            const retryDelay = BASE_DELAY * Math.pow(2, retryCount);
            console.log(`Request failed. Retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await sleep(retryDelay);
            return makeGeminiRequest(url, body, retryCount + 1);
        }
        throw error;
    }
}

function parseJsonResponse(text: string): CompanyContactInfo {
    try {
        // Try parsing directly
        const data = JSON.parse(text);
        return companyContactInfoSchema.parse(data);
    } catch (e) {
        // Try cleaning the text first
        const cleanText = text
            .replace(/^```json\s*/, '')
            .replace(/```$/, '')
            .trim();
        
        try {
            const data = JSON.parse(cleanText);
            return companyContactInfoSchema.parse(data);
        } catch (e) {
            console.error('Failed to parse JSON response:', text);
            throw new Error('Invalid JSON response: ' + e);
        }
    }
}

async function validateCompanyDetails(name: string, details: CompanyContactInfo): Promise<ValidationResult> {
    try {
        const response = await makeGeminiRequest(GEMINI_FLASH_API_URL, {
            contents: [{
                parts: [{
                    text: [
                        `For the Bangladeshi company "${name}" (or its Bangladesh branch/office), verify if the following details are correct:`,
                        JSON.stringify(details, null, 2),
                        'Important:',
                        '1. The company must have a presence in Bangladesh (headquarters or branch office)',
                        '2. The address should be in Bangladesh',
                        '3. Contact information should be for the Bangladesh office',
                        '4. Website should be the official website of the company',
                        '5. Social media links should be for the company\'s official pages',
                        'Respond with ONLY a JSON object in this format:',
                        '{"isValid": true/false, "invalidFields": ["field1", "field2"], "reason": "explanation if invalid"}',
                    ].join('\n'),
                }],
            }],
        });

        const text = response.candidates[0]?.content?.parts[0]?.text;
        
        if (!text) {
            console.error('Invalid validation response format');
            return { isValid: false, invalidFields: [], reason: 'Invalid response format' };
        }

        try {
            return validationResultSchema.parse(JSON.parse(text));
        } catch (e) {
            console.error('Failed to parse validation response:', text);
            return { isValid: false, invalidFields: [], reason: 'Failed to parse validation response: ' + e };
        }
    } catch (error) {
        console.error('Error validating company details:', error);
        return { isValid: false, invalidFields: [], reason: 'Error during validation: ' + error };
    }
}

async function getCorrectedDetails(name: string, invalidFields: string[]): Promise<CompanyContactInfo> {
    try {
        const response = await makeGeminiRequest(GEMINI_FLASH_API_URL, {
            contents: [{
                parts: [{
                    text: [
                        `For the Bangladeshi company "${name}" (or its Bangladesh branch/office), provide correct information for the following fields:`,
                        invalidFields.join(', '),
                        'Important:',
                        '1. The company must have a presence in Bangladesh (headquarters or branch office)',
                        '2. The address should be in Bangladesh',
                        '3. Contact information should be for the Bangladesh office',
                        '4. Website should be the official website of the company',
                        '5. Social media links should be for the company\'s official pages',
                        'Respond with ONLY the JSON object below—no markdown, no code fences, nothing else:',
                        '{"website":"…","linkedin":"…","facebook":"…","github":"…","email":"…","phone":"…","address":"…","description":"…"}',
                    ].join('\n'),
                }],
            }],
        });

        const text = response.candidates[0]?.content?.parts[0]?.text;
        
        if (!text) {
            console.error('Invalid correction response format');
            return {};
        }

        try {
            return parseJsonResponse(text as string);
        } catch (e) {
            console.error('Failed to parse correction response:', text);
            return {};
        }
    } catch (error) {
        console.error('Error getting corrected details:', error);
        return {};
    }
}

async function fetchCompanyDetailsWithRetry(name: string, retryCount = 0): Promise<CompanyContactInfo> {
    try {
        const response = await makeGeminiRequest(GEMINI_FLASH_API_URL, {
            contents: [{
                parts: [{
                    text: [
                        `For the Bangladeshi company "${name}" (or its Bangladesh branch/office), provide the following information in JSON format:`,
                        'Important:',
                        '1. The company must have a presence in Bangladesh (headquarters or branch office)',
                        '2. The address should be in Bangladesh',
                        '3. Contact information should be for the Bangladesh office',
                        '4. Website should be the official website of the company',
                        '5. Social media links should be for the company\'s official pages',
                        'Provide the following details:',
                        '1. Official website URL',
                        '2. LinkedIn company page URL',
                        '3. Facebook page URL',
                        '4. GitHub organization URL (if applicable)',
                        '5. Contact email',
                        '6. Phone number (with Bangladesh country code +880)',
                        '7. Office address in Bangladesh',
                        '8. Brief company description',
                        'Respond with ONLY the JSON object below—no markdown, no code fences, nothing else:',
                        '{"website":"…","linkedin":"…","facebook":"…","github":"…","email":"…","phone":"…","address":"…","description":"…"}',
                    ].join('\n'),
                }],
            }],
        });

        const text = response.candidates[0]?.content?.parts[0]?.text;
        
        if (!text) {
            throw new Error('Invalid response format');
        }

        const contactInfo = parseJsonResponse(text as string);
        const validation = await validateCompanyDetails(name, contactInfo);

        if (!validation.isValid) {
            if (validation.reason.includes('verification is not possible') && retryCount < MAX_REFETCH) {
                console.log(`Verification not possible for ${name}. Refetching data... (Attempt ${retryCount + 1}/${MAX_REFETCH})`);
                await sleep(BASE_DELAY);
                return fetchCompanyDetailsWithRetry(name, retryCount + 1);
            }

            console.log(`Fetching corrected details for ${name}...`);
            const correctedInfo = await getCorrectedDetails(name, validation.invalidFields);
            return correctedInfo;
        }

        return contactInfo;
    } catch (error) {
        if (retryCount < MAX_REFETCH) {
            console.log(`Error fetching details for ${name}. Retrying... (Attempt ${retryCount + 1}/${MAX_REFETCH})`);
            await sleep(BASE_DELAY);
            return fetchCompanyDetailsWithRetry(name, retryCount + 1);
        }
        console.error('Error fetching company info:', error);
        return {};
    }
}

export async function fetchCompanyContactInfoFromGemini(name: string): Promise<CompanyContactInfo> {
    return fetchCompanyDetailsWithRetry(name);
} 