import type { Metadata } from "next";
import "@/styles/globals.css";
import AppProviders from "@/components/layout/AppProviders";

export const metadata: Metadata = {
  title: "Loan Management System",
  description: "LMS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}