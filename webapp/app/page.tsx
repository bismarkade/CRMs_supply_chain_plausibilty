import Link from "next/link";
import { getMinerals, getCompanies, getManifest } from "@/lib/data";

const VBADGE: Record<string, string> = {
  PASS: "bg-good",
  WARN: "bg-warn",
  FAIL: "bg-poor",
};

export default function Home() {
  const minerals = getMinerals();
  const companies = getCompanies();
  const manifest = getManifest();
  const totals = companies.reduce(
    (a, c) => ((a[c.verdict] = (a[c.verdict] || 0) + 1), a),
    {} as Record<string, number>,
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold tracking-widest text-teal">
          SUPPLY-CHAIN COMPLIANCE &amp; PLAUSIBILITY
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-navy">
          Critical Raw-Material Supply-Chain Plausibility
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Geospatial verification of declared supply chains — Lithium · Rare
          Earths · Gold. {companies.length} declared paths ·{" "}
          <span className="font-semibold text-good">{totals.PASS || 0} PASS</span>{" "}
          ·{" "}
          <span className="font-semibold text-warn">{totals.WARN || 0} WARN</span>{" "}
          ·{" "}
          <span className="font-semibold text-poor">{totals.FAIL || 0} FAIL</span>
        </p>
      </header>

      {/* mineral cards */}
      <section className="mb-10 grid gap-4 md:grid-cols-3">
        {minerals.map((m) => (
          <div
            key={m.key}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div
              className="mb-2 inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: m.color }}
            >
              {m.label.toUpperCase()}
            </div>
            <p className="text-sm text-slate-600">{m.tag}</p>
            <div className="mt-3 flex gap-3 text-sm">
              <span className="font-semibold text-good">{m.verdicts.PASS} PASS</span>
              <span className="font-semibold text-warn">{m.verdicts.WARN} WARN</span>
              <span className="font-semibold text-poor">{m.verdicts.FAIL} FAIL</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Top producer: {m.top_country} {m.top_share}%{" "}
              {m.crma_fail && (
                <span className="font-semibold text-poor">· CRMA breach</span>
              )}
            </p>
          </div>
        ))}
      </section>

      {/* company grid */}
      <h2 className="mb-3 text-lg font-bold text-navy">
        Companies ({companies.length})
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <Link
            key={c.id}
            href={`/company/${c.id}`}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal hover:shadow"
          >
            <div>
              <p className="font-semibold text-navy">{c.company}</p>
              <p className="text-xs text-slate-500">
                {c.mineral_label} · {c.origin_mine}, {c.origin_country}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${VBADGE[c.verdict]}`}
            >
              {c.overall} {c.verdict}
            </span>
          </Link>
        ))}
      </div>

      <footer className="mt-10 text-xs text-slate-400">
        Data version {manifest.version} · Plausibility, not proof · Group 1 ·
        PLUS · Phase 0 skeleton
      </footer>
    </main>
  );
}
