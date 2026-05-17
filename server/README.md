## Server (Express API)

Express + TypeScript API for authentication, loan lifecycle management, and payments. Uses MongoDB via Mongoose.

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

Create server/.env with:

```bash
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=uploads
```

## Seed Users

```bash
npm run seed
```

Seed outputs credentials for Admin, Sales, Sanction, Disbursement, Collection, and Borrower roles.

## Run Locally

```bash
npm run dev
```

## Scripts

- npm run dev: start API in dev mode
- npm run seed: seed role accounts
