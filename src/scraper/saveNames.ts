import fs from 'fs/promises';

export default async function saveNames(companyNames: Set<string>): Promise<void> {
    const namesArray = Array.from(companyNames);
    // Sort names while preserving case
    namesArray.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    await fs.writeFile('companyNames.json', JSON.stringify(namesArray, null, 2));
}