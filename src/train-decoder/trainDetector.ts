import fs from 'fs/promises';
import { LeetMapping } from '../leet-detector/types';
import LeetDetector from '../leet-detector/LeetDetector';

export default async function trainDetector() {
    try {
        // Read company names
        const companyNamesData = await fs.readFile('companyNames.json', 'utf-8');
        const companyNames: string[] = JSON.parse(companyNamesData);

        // Read existing mappings
        let mappings: LeetMapping[] = [];
        try {
            const mappingsData = await fs.readFile('leetMappings.json', 'utf-8');
            mappings = JSON.parse(mappingsData);
        } catch {
            // If file doesn't exist or is invalid, start with empty array
            mappings = [];
        }

        // Create and train the detector
        const detector = new LeetDetector(mappings);

        console.log('Processing company names:\n');
        let newMappings = 0;

        for (const name of companyNames) {
            if (detector.isLeet(name)) {
                const decoded = detector.decode(name);
                if (decoded !== name) {
                    await detector.addMapping(name, decoded);
                    newMappings++;
                }
            }
        }

        console.log(`\nProcessed ${companyNames.length} company names`);
        console.log(`Added ${newMappings} new mappings`);

    } catch (error) {
        console.error('Error:', error);
    }
}