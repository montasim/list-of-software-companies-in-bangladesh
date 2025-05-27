import { readFile, writeFile } from 'fs/promises';
import { z } from 'zod';

// Schema for company details
const companySchema = z.object({
    name: z.string(),
    decodedName: z.string().optional(),
    contactInfo: z.object({
        website: z.string(),
        linkedin: z.string(),
        facebook: z.string(),
        github: z.string(),
        email: z.string(),
        phone: z.string(),
        address: z.string(),
        description: z.string(),
    })
});

const companiesSchema = z.array(companySchema);

async function deduplicateCompanies() {
    try {
        // Read the company details file
        const data = await readFile('companyDetails.json', 'utf-8');
        const companies = companiesSchema.parse(JSON.parse(data));

        console.log(`Found ${companies.length} companies before deduplication`);

        // Create a Map to store unique companies by name
        const uniqueCompanies = new Map();

        // Process each company
        for (const company of companies) {
            const existingCompany = uniqueCompanies.get(company.name);
            
            // If company doesn't exist or has less data than current one, update it
            if (!existingCompany || 
                Object.keys(company).length > Object.keys(existingCompany).length) {
                uniqueCompanies.set(company.name, company);
            }
        }

        // Convert Map back to array
        const deduplicatedCompanies = Array.from(uniqueCompanies.values());

        // Sort companies by name
        deduplicatedCompanies.sort((a, b) => a.name.localeCompare(b.name));

        // Save the deduplicated companies
        await writeFile(
            'companyDetails.json',
            JSON.stringify(deduplicatedCompanies, null, 2)
        );

        console.log(`Removed ${companies.length - deduplicatedCompanies.length} duplicate companies`);
        console.log(`Final count: ${deduplicatedCompanies.length} unique companies`);

    } catch (error) {
        console.error('Error deduplicating companies:', error);
        throw error;
    }
}

// Run the deduplication
deduplicateCompanies().catch(console.error); 