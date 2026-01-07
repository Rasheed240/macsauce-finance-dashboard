# Personal Finance Dashboard

A privacy-first personal finance tracker built with React and TypeScript. Upload your bank CSV files and visualize your spending habits with beautiful, interactive charts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.3-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.6-blue)

## Features

### CSV Import
- Drag-and-drop file upload interface
- Automatic column detection (date, amount, description, balance)
- Support for multiple date formats
- Robust error handling and validation
- Real-time parsing feedback

### Smart Categorization
- Automatic transaction categorization
- 50+ merchant pattern recognition
- Manual category override
- Custom category learning

### Data Visualization
- Interactive spending trend charts
- Category breakdown analysis
- Top merchants tracking
- Monthly income vs expenses comparison
- Fully responsive design

### Transaction Management
- Advanced search and filtering
- Sort by date, amount, or category
- Editable transaction categories
- Detailed transaction view

### Privacy & Security
- 100% client-side processing
- No backend servers
- Local storage persistence
- Export/import functionality
- No data tracking

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## CSV File Format

Your CSV file should contain the following columns (names will be auto-detected):

- **Date**: Transaction date
- **Amount**: Transaction amount (negative for expenses, positive for income)
- **Description**: Merchant name or transaction description  
- **Balance**: (Optional) Running account balance

### Example CSV

```csv
Date,Description,Amount,Balance
01/15/2024,Salary Deposit,5000.00,8500.00
01/14/2024,Coffee Shop,-6.50,3500.00
01/13/2024,Online Purchase,-45.99,3506.50
```

### Supported Date Formats
- MM/DD/YYYY
- DD/MM/YYYY
- YYYY-MM-DD
- MMM DD, YYYY

## Usage

1. **Upload Data**: Drag and drop your bank CSV file or click to browse
2. **Review Transactions**: Browse and search through your transactions
3. **Analyze Spending**: View interactive charts and insights
4. **Export Data**: Download your data as JSON for backup

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Papaparse
- date-fns
- Lucide React

## Project Structure

```
src/
├── components/
│   ├── charts/          # Chart components
│   ├── dashboard/       # Dashboard views
│   ├── transactions/    # Transaction table
│   └── upload/          # CSV upload
├── utils/
│   ├── analytics.ts     # Financial calculations
│   ├── categorization.ts # Auto-categorization
│   ├── csvParser.ts     # CSV parsing
│   └── storage.ts       # Local storage
├── types/               # TypeScript definitions
└── data/                # Sample data
```

## Roadmap

- Support for additional file formats (OFX, QFX, JSON)
- Advanced analytics and insights
- Budget tracking
- Recurring transaction detection
- Multi-account support

## Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Privacy Statement

All data processing occurs locally in your browser. No information is transmitted to external servers. Your financial data remains private and secure on your device.
