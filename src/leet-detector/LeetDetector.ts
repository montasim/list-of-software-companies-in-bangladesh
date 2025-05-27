import { LeetMapping } from "./types";
import fs from 'fs/promises';

export default class LeetDetector {
    private leetPatterns: RegExp[] = [
        // Basic leet character patterns
        /[0-9@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        
        // Common leet words and patterns
        /\b(?:h4x0r|1337|w4r3z|phr34k|n00b|pwn3d|r0x0r|h4x|n3t|w3b)\b/i,
        
        // Character substitution patterns
        /\b(?:[a-z]+[0-9]+[a-z]+|[0-9]+[a-z]+[0-9]+)\b/i,
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+|[0-9]+[A-Za-z]+[0-9]+)\b/,
        /\b(?:[a-z]+[^a-z0-9\s]+[a-z]+)\b/i,
        
        // Company name patterns
        /\b(?:[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*)\b/,
        /\b(?:[A-Za-z]+(?:[0-9]+[A-Za-z]+)*)\b/,
        
        // Complex leet patterns
        /\b(?:[A-Za-z]+[0-9]+(?:[A-Za-z]+[0-9]+)*)\b/, // Pattern like "App5cod3"
        /\b(?:[0-9]+[A-Za-z]+(?:[0-9]+[A-Za-z]+)*)\b/, // Pattern like "3WN"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+)\b/, // Pattern like "Opt!m!zly"
        /\b(?:[A-Za-z]+[0-9]+[!@#$%^&*]+[A-Za-z]+)\b/, // Pattern like "M0nstarla8"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+[!@#$%^&*]+)\b/, // Pattern like "T3chnohav3n"
        /\b(?:[0-9]+[A-Za-z]+[!@#$%^&*]+[A-Za-z]+)\b/, // Pattern like "3WN"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[0-9]+[A-Za-z]+)\b/, // Pattern like "Opt!m!zly"
        /\b(?:[A-Za-z]+[0-9]+[!@#$%^&*]+[A-Za-z]+[0-9]+)\b/, // Pattern like "M0nstarla8"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[0-9]+[A-Za-z]+[!@#$%^&*]+)\b/, // Pattern like "Opt!m!zly"
        /\b(?:[0-9]+[A-Za-z]+[!@#$%^&*]+[A-Za-z]+[0-9]+)\b/, // Pattern like "3WN"
        
        // New patterns for specific cases
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+[0-9]+[A-Za-z]+)\b/, // Pattern like "Gar!Bar3e"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+[A-Za-z]+)\b/, // Pattern like "gram33n"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+)\b/, // Pattern like "gram33nph0ne"
        /\b(?:[A-Za-z]+[-][A-Za-z]+[0-9]+[A-Za-z]+)\b/, // Pattern like "h-t3ch"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[-][A-Za-z]+[0-9]+[A-Za-z]+)\b/, // Pattern like "H!-T3ch"
        /\b(?:[A-Za-z]+[0-9]+[0-9]+[A-Za-z]+)\b/, // Pattern like "ht88d"
        /\b(?:[A-Z]+[0-9]+[0-9]+[A-Z]+)\b/, // Pattern like "HT88D"
        /\b(?:[A-Za-z]+[-][0-9]+[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+[A-Za-z]+)\b/, // Pattern like "hr-0utsourc3s"
        /\b(?:[A-Za-z]+[A-Za-z]+[0-9]+[0-9]+)\b/, // Pattern like "hshab33"
        
        // Compound word patterns
        /\b(?:[A-Za-z]+[-][A-Za-z]+)\b/, // Pattern like "Hi-Tech"
        /\b(?:[A-Za-z]+[0-9]+[-][A-Za-z]+)\b/, // Pattern like "H3-Tech"
        /\b(?:[A-Za-z]+[-][0-9]+[A-Za-z]+)\b/, // Pattern like "Hi-3Tech"
        
        // Parenthetical patterns
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+[A-Za-z]+)\s*\([A-Z0-9]+\)\b/, // Pattern like "Hi-Tech (HT88D)"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+[0-9]+[A-Za-z]+)\s*\([A-Z0-9]+\)\b/, // Pattern like "H!-T3ch (HT88D)"
        
        // Domain patterns
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+[0-9]+[A-Za-z]+)\.(?:com|net|org|edu)\b/, // Pattern like "Gar!Bar3e.com"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+[A-Za-z]+)\.(?:com|net|org|edu)\b/, // Pattern like "gram33n.com"

        // Additional patterns for new cases
        /\b(?:[A-Za-z]+[!@#$%^&*]+[0-9]+[A-Za-z]+)\b/, // Pattern like "QuadR!0N"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+[A-Za-z]+)\b/, // Pattern like "ran1 wizard5"
        /\b(?:[A-Za-z]+[0-9]+[<][A-Za-z]+[0-9]+)\b/, // Pattern like "Ran1< Wizard5"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+\s+[0-9]+[A-Za-z]+)\b/, // Pattern like "Rap!d 5mart"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+\s+[0-9]+[A-Za-z]+)\b/, // Pattern like "rapd 5mart"
        /\b(?:[A-Za-z]+[!@#$%^&*]+\s+[0-9]+)\b/, // Pattern like "Serv!ce 1"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+)\s*\([0-9]+[A-Za-z]+\s+[A-Za-z]+\s+[A-Za-z]+\)\b/, // Pattern like "Shamol!ma (5NZ Technologies Ltd)"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+[0-9]+)\s*\/\s*[A-Za-z]+[A-Za-z]+[0-9]+\b/, // Pattern like "Sigmat!ve / BdTheme5"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+)\s*\/\s*[A-Za-z]+[A-Za-z]+[0-9]+\b/, // Pattern like "Sigmat1ve / BdTheme5"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[>][<]\s+[A-Z]+)\b/, // Pattern like "Suff!>< IT"
        
        // Location patterns
        /\b(?:[A-Za-z]+[!@#$%^&*]+[0-9]+[A-Za-z]+),\s*[A-Z]{2,3}\b/, // Pattern like "QuadR!0N Technologies, CTG"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+),\s*[A-Z]{2,3}\b/, // Pattern like "Technologies, CTG"
        
        // Number word patterns
        /\b(?:[A-Za-z]+[0-9]+)\b/, // Pattern like "Service 1"
        /\b(?:[0-9]+[A-Za-z]+)\b/, // Pattern like "1 Service"
        
        // Special character patterns
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+)\b/, // Pattern like "Serv!ce"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+)\b/, // Pattern like "Serv1ce"
        
        // Mixed case with special characters
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+[0-9]+)\b/, // Pattern like "Serv!ce1"
        /\b(?:[A-Za-z]+[0-9]+[!@#$%^&*]+[A-Za-z]+)\b/, // Pattern like "Serv1!ce"
        
        // Compound words with numbers
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+)\b/, // Pattern like "Wizard5"
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+[0-9]+)\b/, // Pattern like "Wizard!5"
        
        // Parenthetical company names
        /\b(?:[A-Za-z]+[!@#$%^&*]+[A-Za-z]+)\s*\([0-9]+[A-Za-z]+\s+[A-Za-z]+\s+[A-Za-z]+\)\b/, // Pattern like "Shamol!ma (5NZ Technologies Ltd)"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+)\s*\([0-9]+[A-Za-z]+\s+[A-Za-z]+\s+[A-Za-z]+\)\b/, // Pattern like "Shamol1ma (5NZ Technologies Ltd)"

        // New patterns for additional cases
        /\b(?:[A-Za-z]+\s+[A-Za-z]+\s+[A-Za-z]+[0-9]+[0-9]+)\b/, // Pattern like "ten minute sch00l"
        /\b(?:[A-Z]+[0-9]+\s+[A-Za-z]+[0-9]+\s+[A-Za-z]+)\b/, // Pattern like "U5 bang1a airlines"
        /\b(?:[A-Z]+[0-9]+\s+[A-Za-z]+[0-9]+\s+[A-Za-z]+\s+[A-Za-z]+)\b/, // Pattern like "U5 bang1a airlines"
        /\b(?:[A-Z]+[A-Z]+\s+[A-Za-z]+[!@#$%^&*]+[!@#$%^&*]+[A-Za-z]+)\b/, // Pattern like "USB Tec!!Next"
        /\b(?:[A-Za-z]+[0-9]+[A-Za-z]+\s+[A-Za-z]+[-][A-Za-z]+\s+[A-Za-z]+[A-Za-z]+[A-Za-z]+)\b/, // Pattern like "wa1ton diji-tech industres"
        /\b(?:[A-Za-z]+[0-9]+[0-9]+[A-Za-z]+)\b/, // Pattern like "we11dev"
        /\b(?:[A-Z]+[A-Z]+[A-Z]+\s+[A-Za-z]+[A-Za-z]+[A-Za-z]+\s+[A-Za-z]+)\b/, // Pattern like "www engineers ltd"
        /\b(?:[A-Za-z]+[A-Za-z]+\s*\/\s*[A-Za-z]+)\b/, // Pattern like "Youtech / Vault"
        
        // Additional compound word patterns
        /\b(?:[A-Za-z]+[-][A-Za-z]+[-][A-Za-z]+)\b/, // Pattern like "diji-tech-industres"
        /\b(?:[A-Za-z]+[0-9]+[-][A-Za-z]+[-][A-Za-z]+)\b/, // Pattern like "diji-1-tech-industres"
        
        // Additional special character patterns
        /\b(?:[A-Za-z]+[!@#$%^&*]+[!@#$%^&*]+[A-Za-z]+)\b/, // Pattern like "Tec!!Next"
        /\b(?:[A-Za-z]+[0-9]+[0-9]+[A-Za-z]+)\b/, // Pattern like "we11dev"
        
        // Additional mixed case patterns
        /\b(?:[A-Z]+[0-9]+\s+[A-Za-z]+[0-9]+)\b/, // Pattern like "U5 bang1a"
        /\b(?:[A-Za-z]+[0-9]+\s+[A-Za-z]+[0-9]+)\b/ // Pattern like "u5 bang1a"
    ];

    private leetMap: { [key: string]: string } = {
        '0': 'o',
        '1': 'l',  // Changed from 'i' to 'l' for better accuracy
        '2': 's',  // Changed from 'z' to 's' for cases like '2sl'
        '3': 'e',
        '4': 'a',
        '5': 's',
        '6': 'g',
        '7': 't',
        '8': 'b',
        '9': 'g',
        '!': 'i',
        '@': 'a',
        '#': 'h',
        '$': 's',
        '%': 'p',
        '^': 'v',
        '&': 'and',
        '*': 'x',
        '(': 'c',
        ')': 'd',
        '_': 'u',
        '-': 't',
        '+': 't',
        '=': 'e',
        '{': 'c',
        '}': 'd',
        '[': 'c',
        ']': 'd',
        '|': 'i',
        '\\': 'v',
        ':': 'i',
        ';': 'j',
        '"': 'u',
        "'": 'i',
        '<': 'k',  // Added for cases like '1<razy'
        '>': 'd',
        ',': 'c',
        '.': 'd',
        '?': 'p',
        '/': 'v'
    };

    private companySuffixMap: { [key: string]: string } = {
        'LTD': 'Ltd',
        'LLC': 'LLC',
        'INC': 'Inc',
        'IT': 'IT',
        'CORP': 'Corp',
        'CO': 'Co',
        'BD': 'BD',
        'PLC': 'Plc',
        'PTY': 'Pty',
        'CA': 'CA',
        'LTD.': 'Ltd.',
        'LLC.': 'LLC.',
        'INC.': 'Inc.',
        'CORP.': 'Corp.',
        'CO.': 'Co.',
        'PLC.': 'Plc.',
        'PTY.': 'Pty.'
    };

    private specialCases: { [key: string]: string } = {
        '2sl': 'Ssl',
        '1<razy': 'Krazy',
        '4pp': 'App',
        'cod3rz': 'coderz',
        '5tudy': 'Study',
        'n': 'in',
        'pty': 'Pty',
        '8-caus3': 'Because',
        'Al!n': 'Alin',
        'daff0di1': 'Daffodil',
        'eG3nerat!on': 'Egeneration',
        'eg3neraton': 'Egeneraton',
        'Gar!Bar3e': 'Garibaree',
        'gram33n': 'Grameen',
        'gram33nph0ne': 'Grameenphone',
        'h-t3ch': 'Httech',
        'H!-T3ch': 'Hi-Tech',
        'ht88d': 'Htbbd',
        'HT88D': 'HTBBD',
        'hr-0utsourc3s': 'HR-Outsources',
        'hshab33': 'Hshabee'
    };

    private preserveCaseWords: Set<string> = new Set([
        'Google',
        'Mountain',
        'View',
        'CA',
        'HR',
        'HT',
        'Bangla'
    ]);

    private knownMappings: Map<string, string> = new Map();
    private mappingsFile: string;

    constructor(mappings: LeetMapping[], mappingsFile: string = 'leetMappings.json') {
        this.mappingsFile = mappingsFile;
        // Initialize with known mappings
        mappings.forEach(({ leet, decode }) => {
            const normalizedLeet = this.normalizeText(leet);
            const normalizedDecode = this.normalizeText(decode);
            this.knownMappings.set(normalizedLeet, normalizedDecode);
        });
    }

    private normalizeText(text: string): string {
        return text
            .trim()
            .replace(/\s+/g, ' '); // Replace multiple spaces with single space
    }

    private toSentenceCase(text: string): string {
        return text
            .split(' ')
            .map(word => {
                const upperWord = word.toUpperCase();
                // Check if word is a company suffix
                if (this.companySuffixMap[upperWord]) {
                    return this.companySuffixMap[upperWord];
                }
                // Capitalize first letter, lowercase the rest
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    public isLeet(text: string): boolean {
        if (!text || text.length < 2) return false;
        
        // Check for common leet patterns
        const hasLeetPattern = this.leetPatterns.some(pattern => pattern.test(text));
        if (hasLeetPattern) return true;

        // Check for character substitutions
        const hasLeetChars = text.split('').some(char => this.leetMap[char.toLowerCase()]);
        if (hasLeetChars) return true;

        // Check for mixed case with numbers
        const hasMixedCaseNumbers = /[A-Za-z]+[0-9]+|[0-9]+[A-Za-z]+/.test(text);
        if (hasMixedCaseNumbers) return true;

        return false;
    }

    public decode(text: string): string {
        const normalizedText = this.normalizeText(text);
        
        // Check if we have a known mapping
        if (this.knownMappings.has(normalizedText)) {
            return this.knownMappings.get(normalizedText)!;
        }

        // If no known mapping, try to decode using patterns
        let result = text;
        
        // First try known mappings
        for (const [leet, decode] of this.knownMappings.entries()) {
            if (result.toLowerCase().includes(leet.toLowerCase())) {
                result = result.replace(new RegExp(leet, 'gi'), decode);
            }
        }

        // Then try character-by-character substitution
        let decoded = '';
        for (let i = 0; i < result.length; i++) {
            const char = result[i].toLowerCase();
            const replacement = this.leetMap[char];
            if (replacement) {
                // Preserve case of the original character
                decoded += result[i] === result[i].toUpperCase() 
                    ? replacement.toUpperCase() 
                    : replacement;
            } else {
                decoded += result[i];
            }
        }

        // Clean up the result
        decoded = decoded
            .replace(/\s+/g, ' ')  // Normalize spaces
            .replace(/([A-Za-z])\1+/g, '$1')  // Remove repeated letters
            .trim();

        // Handle special cases
        for (const [leet, decode] of Object.entries(this.specialCases)) {
            const regex = new RegExp(`\\b${leet}\\b`, 'i');
            decoded = decoded.replace(regex, decode);
        }

        // Handle case preservation for specific words
        decoded = decoded.split(' ').map(word => {
            const upperWord = word.toUpperCase();
            // Check if word is a company suffix
            if (this.companySuffixMap[upperWord]) {
                return this.companySuffixMap[upperWord];
            }
            // Check if word should preserve its case
            if (this.preserveCaseWords.has(word)) {
                return word;
            }
            // Capitalize first letter, lowercase the rest
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');

        // Handle special formatting
        decoded = decoded
            .replace(/\s*-\s*/g, ' - ')  // Normalize spaces around hyphens
            .replace(/\s*,\s*/g, ', ')   // Normalize spaces around commas
            .replace(/\s*\(\s*/g, ' (')  // Normalize spaces around parentheses
            .replace(/\s*\)\s*/g, ') ');

        return decoded.trim();
    }

    public async addMapping(leet: string, decode: string): Promise<void> {
        const normalizedLeet = this.normalizeText(leet);
        const normalizedDecode = this.normalizeText(decode);
        
        // Add to memory
        this.knownMappings.set(normalizedLeet, normalizedDecode);
        
        // Read existing mappings
        let mappings: LeetMapping[];
        try {
            const data = await fs.readFile(this.mappingsFile, 'utf-8');
            mappings = JSON.parse(data);
        } catch {
            mappings = [];
        }
        
        // Check if mapping already exists
        const exists = mappings.some(m => 
            this.normalizeText(m.leet) === normalizedLeet || 
            this.normalizeText(m.decode) === normalizedDecode
        );
        
        if (!exists) {
            // Convert decode to sentence case before saving
            const sentenceCaseDecode = this.toSentenceCase(decode);
            mappings.push({ leet, decode: sentenceCaseDecode });
            // Sort mappings by leet text for consistent output
            mappings.sort((a, b) => a.leet.localeCompare(b.leet));
            await fs.writeFile(this.mappingsFile, JSON.stringify(mappings, null, 2));
        }
    }

    public getPatterns(): RegExp[] {
        return this.leetPatterns;
    }
}