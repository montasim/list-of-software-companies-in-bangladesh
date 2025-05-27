# Leet Detection and Decode Chrome Extension

A tool that detects and decodes leetspeak (1337) text in https://deshimula.com/ web pages, with a focus on company names and details.

## Features

- Real-time leetspeak detection in web pages
- Automatic decoding of leetspeak to readable text
- Specialized company name detection and decoding
- Training system for improving leetspeak detection accuracy
- Company details scraping and validation

## Project Structure

```
├── src/
│   ├── config/         # Configuration files
│   ├── leet-detector/  # Core leetspeak detection logic
│   ├── scraper/        # Web scraping utilities
│   ├── services/       # Business logic services
│   ├── train-decoder/  # Training system for leetspeak detection
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── dist/               # Compiled JavaScript output
└── various JSON files for data storage
```

## Prerequisites

- Node.js (v14 or higher)
- pnpm package manager
- Chrome browser

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd leet-detection-and-decode
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

## Development

- Run in development mode:
```bash
pnpm dev
```

- Build the project:
```bash
pnpm build
```

- Start the production build:
```bash
pnpm start
```

## Data Files

The project uses several JSON files for data management:
- `companyDetails.json`: Detailed company information
- `decodedCompanies.json`: Mapped leetspeak variations to company names
- `leetMappings.json`: Leetspeak character mappings
- `validMappings.json`: Validated leetspeak mappings
- `invalidMappings.json`: Invalid or rejected mappings

## Dependencies

### Main Dependencies
- cheerio: HTML parsing and manipulation
- dotenv: Environment variable management
- node-fetch: HTTP client
- puppeteer: Headless browser automation
- zod: Runtime type checking

### Development Dependencies
- TypeScript
- ts-node
- nodemon
- @types/node
- @types/node-fetch

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Thanks to all contributors who have helped improve the leetspeak detection and decoding capabilities
- Special thanks to the open-source community for the tools and libraries used in this project 