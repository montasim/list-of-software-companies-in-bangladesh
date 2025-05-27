import fs from 'fs/promises';
import LeetDetector from '../leet-detector/LeetDetector';
import { CompanyDetails, LeetMapping } from '../types/company';
import { fetchCompanyContactInfoFromGemini } from './geminiService';

export async function fetchCompanyDetails(): Promise<void> {
    try {
        // Read leet mappings
        const mappingsData = await fs.readFile('leetMappings.json', 'utf-8');
        const mappings: LeetMapping[] = JSON.parse(mappingsData);

        // Create detector instance
        const detector = new LeetDetector(mappings);

        // Read existing company details if any
        let companyDetails: CompanyDetails[] = [];
        try {
            const existingData = await fs.readFile('companyDetails.json', 'utf-8');
            companyDetails = JSON.parse(existingData);
            console.log(`Found ${companyDetails.length} existing company details`);
        } catch (error) {
            console.log('No existing company details found, starting fresh');
        }

        // Get list of companies that haven't been processed yet
        const processedCompanies = new Set(companyDetails.map(detail => detail.decodedName));
        const companiesToProcess = mappings.filter(mapping => !processedCompanies.has(mapping.decode));

        console.log(`\nFound ${companiesToProcess.length} companies to process`);

        // Process each company one at a time
        for (const [index, mapping] of companiesToProcess.entries()) {
            try {
                console.log(`\nProcessing company ${index + 1}/${companiesToProcess.length}: ${mapping.decode}`);
                
                // Fetch contact info
                const contactInfo = await fetchCompanyContactInfoFromGemini(mapping.decode);
                
                // Add to company details
                companyDetails.push({
                    leetName: mapping.leet,
                    decodedName: mapping.decode,
                    contactInfo
                });

                // Save after each successful fetch
                await fs.writeFile(
                    'companyDetails.json',
                    JSON.stringify(companyDetails, null, 2)
                );

                console.log(`Successfully saved details for ${mapping.decode}`);

                // Add a delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Error processing ${mapping.decode}:`, error);
                // Continue with next company even if one fails
                continue;
            }
        }

        console.log('\nCompany details have been saved to companyDetails.json');

    } catch (error) {
        console.error('Error:', error);
    }
} 