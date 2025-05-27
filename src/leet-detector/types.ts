import { z } from 'zod';

// Schema for leet mappings
export const leetMappingSchema = z.object({
    leet: z.string(),
    decode: z.string()
});

export const leetMappingsSchema = z.array(leetMappingSchema);

// TypeScript types
export type LeetMapping = z.infer<typeof leetMappingSchema>;
export type LeetMappings = z.infer<typeof leetMappingsSchema>;

// Options for leet detector
export interface LeetDetectorOptions {
    minLength?: number;
    maxLength?: number;
    minConfidence?: number;
    maxMappings?: number;
    mappings?: LeetMappings;
}

// Statistics for leet detector
export interface LeetDetectorStats {
    totalMappings: number;
    validMappings: number;
    invalidMappings: number;
    avgLength: number;
    avgConfidence: number;
    avgMappings: number;
    errors: string[];
}