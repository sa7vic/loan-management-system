## Client (Next.js)

Borrower portal and operations dashboard UI built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

Create client/.env.local with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If you already have NEXT_PUBLIC_API_BASE_URL set, it will also be honored.

## Run Locally

```bash
npm run dev
```

Open http://localhost:3000.

## Notes

- Borrower apply flow: /apply
- Operations dashboard: /dashboard
