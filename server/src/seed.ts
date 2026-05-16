import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "./config/db";
import { env } from "./config/env";
import { User } from "./models/User";

type SeedUser = {
  fullName: string;
  email: string;
  password: string;
  role: "ADMIN" | "SALES" | "SANCTION" | "DISBURSEMENT" | "COLLECTION" | "BORROWER";
};

const seedUsers: SeedUser[] = [
  { fullName: "Admin User", email: "admin@lms.local", password: "Admin@123", role: "ADMIN" },
  { fullName: "Sales User", email: "sales@lms.local", password: "Sales@123", role: "SALES" },
  { fullName: "Sanction User", email: "sanction@lms.local", password: "Sanction@123", role: "SANCTION" },
  { fullName: "Disbursement User", email: "disbursement@lms.local", password: "Disbursement@123", role: "DISBURSEMENT" },
  { fullName: "Collection User", email: "collection@lms.local", password: "Collection@123", role: "COLLECTION" },
  { fullName: "Borrower User", email: "borrower@lms.local", password: "Borrower@123", role: "BORROWER" },
];

async function upsertUser(u: SeedUser) {
  const passwordHash = await bcrypt.hash(u.password, 10);

  await User.updateOne(
    { email: u.email },
    {
      $set: {
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        passwordHash,
        isActive: true,
      },
    },
    { upsert: true }
  );
}

async function main() {
  console.log("Seeding LMS users...");
  if (!env.MONGODB_URI) throw new Error("MONGODB_URI not set");
  await connectDb();

  for (const u of seedUsers) {
    await upsertUser(u);
  }

  console.log("\nSeed complete. Credentials:");
  for (const u of seedUsers) {
    console.log(`- role=${u.role} email=${u.email} password=${u.password}`);
  }

  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await disconnectDb();
  } catch {}
  process.exit(1);
});