# Loan Management System (LMS)

Full-stack lending platform with a borrower application flow and an internal operations dashboard. Built as a monorepo with a Next.js 14 client and an Express + MongoDB server.

YouTube Link - https://youtu.be/DDG89lun7W8

Deployed Link - https://loan-management-system-client-yup7.vercel.app

## Overview

Two main surfaces:

- Borrower Portal: multi-step application that ends in a loan request.
- Operations Dashboard: role-based modules for Sales, Sanction, Disbursement, and Collection.

Roles and access:

- Borrower: portal only.
- Sales, Sanction, Disbursement, Collection: restricted to their module.
- Admin: access to all modules.

Loan lifecycle:

APPLIED -> SANCTIONED -> DISBURSED -> CLOSED
Rejected loans can be closed with a reason.

## Borrower Flow

1) Auth: sign up and login (JWT, password hashing)
2) Personal details + eligibility check (BRE)
3) Salary slip upload (PDF/JPG/PNG, max 5 MB)
4) Loan configuration and apply

BRE rules (server-side):

- Age between 23 and 50
- Salary >= 25000 per month
- Valid PAN format
- Employment is not Unemployed

Loan math:

Simple Interest (SI) = (P x R x T) / (365 x 100), where T is tenure in days
Total Repayment = P + SI (R = 12% p.a.)

## Operations Dashboard

- Sales: lead tracking for registered users who have not applied
- Sanction: approve or reject applied loans with a reason
- Disbursement: mark sanctioned loans as disbursed
- Collection: record payments (unique UTR per payment). Auto-close when total paid equals total repayment

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- Database: MongoDB, Mongoose
- Auth: JWT, bcrypt

## Project Structure

- client: Next.js app (App Router)
- server: Express API and MongoDB models

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
NODE_ENV=development
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

If you already have NEXT_PUBLIC_API_BASE_URL set, it will also be honored.

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

## Run Locally

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Open http://localhost:3000.

## Scripts

Server:

- npm run dev: start API in dev mode
- npm run seed: seed role accounts

Client:

- npm run dev: start Next.js app

## Notes

- Borrower apply flow: /apply
- Operations dashboard: /dashboard
