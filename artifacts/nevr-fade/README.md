# Cyberpunk Fashion Hub - Never Fade

A modern cyberpunk-themed fashion e-commerce platform.

## Getting Started

### Prerequisites

- Node.js v20.20.0 or higher
- pnpm package manager

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm run dev
   ```

### Database Setup

The application uses SQLite for data storage. The database is automatically initialized when the server starts.

### Common Issues

#### SQLite3 Native Module Error
If you encounter errors related to the sqlite3 native module, run:
```bash
pnpm rebuild sqlite3
```

Or if you're using npm:
```bash
npm uninstall sqlite3
npm install sqlite3
```

## Project Structure

- `src/` - Frontend source code
- `server.js` - Backend server
- `database/` - Database initialization and schema
- `public/` - Static assets

## Development

### Running Development Server

```bash
# Start both frontend and backend
pnpm run dev

# Start backend only
pnpm run dev:backend

# Start frontend only
pnpm run dev:frontend
```

## Deployment

The application is configured for deployment with PM2 (process manager).

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
PORT=7826
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin1234
RAZORPAY_KEY_SECRET=obLZ9i1EfoGJbbmfs3zadPrT
VITE_RAZORPAY_KEY_ID=rzp_live_SeGhjLl3Q4JDFO
```

## License

This project is licensed under the MIT License.