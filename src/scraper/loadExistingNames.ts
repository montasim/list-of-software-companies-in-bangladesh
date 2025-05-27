import fs from 'fs/promises';

export default async function loadExistingNames(): Promise<Set<string>> {
    try {
        const data = await fs.readFile('companyNames.json', 'utf-8');
        const names = JSON.parse(data);
        return new Set(names);
    } catch {
        return new Set();
    }
}