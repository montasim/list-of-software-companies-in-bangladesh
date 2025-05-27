import scrapeCompanyNames from './scraper/scrapeCompanyNames';
import LeetDetector from './leet-detector/LeetDetector';
import trainLeetDetector from './train-decoder/trainDetector';
import { fetchCompanyDetails } from './services/companyService';
import { readFile, writeFile } from 'fs/promises';
import { z } from 'zod';

// Schema for company names
const companyNamesSchema = z.array(z.string());

async function main() {
    try {
        // Step 1: Scrape company names
        console.log('Step 1: Scraping company names...');
        const leetCompanyNames = await scrapeCompanyNames();
        console.log('Company names scraping completed.\n');

        // Read company names
        const companyNamesData = await readFile('companyNames.json', 'utf-8');
        const companyNames = companyNamesSchema.parse(JSON.parse(companyNamesData));

        // Initialize detector with empty mappings
        const detector = new LeetDetector([]);

        // Process each company name
        const decodedNames = new Map<string, string>();
        for (const name of companyNames) {
            const decoded = detector.decode(name);
            if (decoded) {
                decodedNames.set(name, decoded);
            }
        }

        // Save decoded names
        await writeFile(
            'decodedCompanies.json',
            JSON.stringify(Object.fromEntries(decodedNames), null, 2)
        );

        console.log(`Processed ${companyNames.length} company names`);
        console.log(`Successfully decoded ${decodedNames.size} names\n`);

        // Step 3: Train leet detector
        console.log('Step 3: Training leet detector...');
        await trainLeetDetector();
        console.log('Leet detector training completed.\n');

        // Step 4: Fetch company details
        console.log('Step 4: Fetching company details...');
        await fetchCompanyDetails();
        console.log('Company details fetching completed.\n');

        console.log('All steps completed successfully!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main().catch(console.error); 