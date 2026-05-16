# Loan Management System (LMS)

Monorepo with a Next.js 14 client and an Express + MongoDB server.

## Setup

1) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

2) Configure environment variables

Create the following files:

- server/.env
- client/.env.local

Use the templates below.

### server/.env

```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=uploads
```

### client/.env.local

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If you already have `NEXT_PUBLIC_API_BASE_URL` set, it will also be honored.

3) Seed users

```bash
cd server
npm run seed
```

Seed outputs credentials for Admin, Sales, Sanction, Disbursement, Collection, and Borrower roles.

### Seeded credentials

- ADMIN: admin@lms.local / Admin@123
- SALES: sales@lms.local / Sales@123
- SANCTION: sanction@lms.local / Sanction@123
- DISBURSEMENT: disbursement@lms.local / Disbursement@123
- COLLECTION: collection@lms.local / Collection@123
- BORROWER: borrower@lms.local / Borrower@123

## Run locally

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Open http://localhost:3000.

## Notes

- Borrower apply flow is at /apply
- Operations dashboard is at /dashboard