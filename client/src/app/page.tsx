export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="fade-up">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">Loan Management System</p>
        <h1 className="headline mt-4 text-4xl sm:text-5xl lg:text-6xl">
          Streamline approvals, disbursement, and collections in one flow.
        </h1>
        <p className="mt-6 text-lg text-[var(--color-muted)] max-w-xl">
          Built for sales, sanction, disbursement, and collection teams with a borrower-first
          application journey and instant eligibility checks.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Log in
          </a>
          <a
            href="/apply"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:-translate-y-0.5"
          >
            Start borrower application
          </a>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { title: "BRE checks", desc: "Instant eligibility with PAN, age, and income rules." },
            { title: "Role modules", desc: "Focused workspaces for each ops team." },
            { title: "Live math", desc: "Simple-interest repayment updates in real time." },
          ].map((item) => (
            <div key={item.title} className="card-surface rounded-2xl p-4">
              <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="fade-up card-surface rounded-3xl p-8 lg:mt-10">
        <h2 className="headline text-2xl">Highlights</h2>
        <ul className="mt-6 space-y-4 text-sm text-[var(--color-muted)]">
          <li>
            <span className="font-semibold text-[var(--color-ink)]">Borrower-first flow</span> with guided
            eligibility checks and uploads.
          </li>
          <li>
            <span className="font-semibold text-[var(--color-ink)]">Operational control</span> across
            sanction, disbursement, and collection.
          </li>
          <li>
            <span className="font-semibold text-[var(--color-ink)]">Transparent math</span> with live interest
            and repayment updates.
          </li>
        </ul>
      </aside>
    </main>
  );
}