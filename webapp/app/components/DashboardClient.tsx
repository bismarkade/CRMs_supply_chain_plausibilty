"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Layers } from "lucide-react";
import type { MineralSummary, CompanyListItem } from "@/lib/types";
import { MINERAL_LABEL, MINERAL_COLOR, VERDICT_COLORS } from "./constants";
import { MineralIcon } from "./icons";

const MapLeaflet = dynamic(() => import("./MapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[480px] place-items-center bg-slate-900 text-slate-500">
      Loading map…
    </div>
  ),
});

export default function DashboardClient({
  minerals,
  companies,
  paths,
  initialMineral = "all",
}: {
  minerals: MineralSummary[];
  companies: CompanyListItem[];
  paths: any[];
  initialMineral?: string;
}) {
  const [mineral, setMineral] = useState(initialMineral);
  const [verdict, setVerdict] = useState("all");

  // keep filter in sync when the URL (?mineral=) changes via the top nav
  useEffect(() => setMineral(initialMineral), [initialMineral]);

  const fc = companies.filter(
    (c) =>
      (mineral === "all" || c.mineral === mineral) &&
      (verdict === "all" || c.verdict === verdict),
  );
  const ff = paths.filter(
    (p) =>
      (mineral === "all" || p.mineral === mineral) &&
      (verdict === "all" || p.verdict === verdict),
  );
  const tally = fc.reduce(
    (a, c) => ((a[c.verdict] = (a[c.verdict] || 0) + 1), a),
    {} as Record<string, number>,
  );
  const countMineral = (k: string) =>
    k === "all" ? companies.length : companies.filter((c) => c.mineral === k).length;

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
      {/* ---------- sidebar ---------- */}
      <aside className="sticky top-[64px] hidden h-fit w-60 shrink-0 space-y-6 lg:block">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Layers className="h-3.5 w-3.5" /> Mineral
          </p>
          <div className="space-y-1">
            {[{ key: "all", label: "All minerals" }, ...minerals].map((m: any) => {
              const active = mineral === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMineral(m.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  style={active ? { background: MINERAL_COLOR[m.key] || "#0B3954" } : {}}
                >
                  <span className="flex items-center gap-2">
                    {m.key !== "all" && (
                      <MineralIcon mineral={m.key} className="h-4 w-4" />
                    )}
                    {m.label}
                  </span>
                  <span
                    className={`rounded-full px-1.5 text-xs ${active ? "bg-white/25" : "bg-slate-200 text-slate-500"}`}
                  >
                    {countMineral(m.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Verdict
          </p>
          <div className="space-y-1">
            {["all", "PASS", "WARN", "FAIL"].map((v) => {
              const active = verdict === v;
              return (
                <button
                  key={v}
                  onClick={() => setVerdict(v)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active ? "text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                  style={active ? { background: VERDICT_COLORS[v] || "#0B3954" } : {}}
                >
                  {v !== "all" && (
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background: active ? "#fff" : VERDICT_COLORS[v],
                      }}
                    />
                  )}
                  {v === "all" ? "All verdicts" : v}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ---------- main ---------- */}
      <main className="min-w-0 flex-1">
        <header className="mb-5">
          <p className="text-xs font-bold tracking-widest text-teal">
            SUPPLY-CHAIN COMPLIANCE &amp; PLAUSIBILITY
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-navy">
            Critical Raw-Material Supply Chains
          </h1>
          <p className="mt-1 text-slate-600">
            Geospatial verification of declared supply chains — explore, filter,
            and open per-company reports.
          </p>
        </header>

        {/* KPIs */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Paths", fc.length, "#0B3954"],
            ["PASS", tally.PASS || 0, VERDICT_COLORS.PASS],
            ["WARN", tally.WARN || 0, VERDICT_COLORS.WARN],
            ["FAIL", tally.FAIL || 0, VERDICT_COLORS.FAIL],
          ].map(([l, n, c], i) => (
            <motion.div
              key={l as string}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="text-2xl font-extrabold" style={{ color: c as string }}>
                {n as number}
              </div>
              <div className="text-xs font-semibold uppercase text-slate-400">
                {l as string}
              </div>
            </motion.div>
          ))}
        </div>

        {/* map */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 overflow-hidden rounded-2xl border border-slate-800 shadow-lg"
        >
          <MapLeaflet paths={ff} basemap="dark" />
        </motion.div>

        {/* company cards */}
        <h2 className="mb-3 text-lg font-bold text-navy">
          Companies ({fc.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {fc.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
            >
              <Link
                href={`/company/${c.id}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-lg text-white"
                    style={{ background: MINERAL_COLOR[c.mineral] }}
                  >
                    <MineralIcon mineral={c.mineral} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-navy">{c.company}</p>
                    <p className="text-xs text-slate-500">
                      {MINERAL_LABEL[c.mineral]} · {c.origin_mine},{" "}
                      {c.origin_country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                    style={{ background: VERDICT_COLORS[c.verdict] }}
                  >
                    {c.overall} {c.verdict}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-teal" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
