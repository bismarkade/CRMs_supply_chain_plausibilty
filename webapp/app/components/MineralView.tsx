"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import type { MineralSummary, CompanyListItem } from "@/lib/types";
import { MINERAL_COLOR, VERDICT_COLORS, band } from "./constants";
import { MineralIcon } from "./icons";
import ProdTreemap from "./Treemap";

const MapLeaflet = dynamic(() => import("./MapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[420px] place-items-center bg-slate-900 text-slate-500">
      Loading map…
    </div>
  ),
});

const Card = ({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
  >
    {title && (
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-teal">
        {title}
      </h3>
    )}
    {children}
  </section>
);

export default function MineralView({
  mineral,
  companies,
  paths,
}: {
  mineral: MineralSummary;
  companies: CompanyListItem[];
  paths: any[];
}) {
  const color = MINERAL_COLOR[mineral.key];
  const v = mineral.verdicts;
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Link href="/" className="text-sm font-semibold text-teal hover:underline">
        ← Back to overview
      </Link>

      {/* hero */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-2 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow"
            style={{ background: color }}
          >
            <MineralIcon mineral={mineral.key} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-navy">{mineral.label}</h1>
            <p className="text-slate-600">{mineral.tag}</p>
            <p className="text-xs text-slate-400">{mineral.regime}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["PASS", "WARN", "FAIL"] as const).map((k) => (
            <div
              key={k}
              className="rounded-xl px-4 py-2 text-center text-white"
              style={{ background: VERDICT_COLORS[k] }}
            >
              <div className="text-xl font-extrabold">{v[k]}</div>
              <div className="text-[10px] font-bold uppercase">{k}</div>
            </div>
          ))}
        </div>
      </motion.header>

      {/* uses + regulation */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="What it is used for">
          <ul className="space-y-2">
            {mineral.uses.map((u, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                {u}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Regulatory framework">
          <ul className="space-y-2">
            {mineral.regulation.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* production + map */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Production concentration (USGS MCS 2025)">
          <ProdTreemap production={mineral.production} />
          <p className="mt-2 text-xs text-slate-500">
            Top producer: <b>{mineral.top_country}</b> {mineral.top_share}%{" "}
            {mineral.crma_fail && (
              <span className="font-semibold text-poor">
                · CRMA single-country breach (&gt;65%)
              </span>
            )}
            <br />
            World total {mineral.world_total.toLocaleString()} t · Source:{" "}
            {mineral.prod_page}
          </p>
        </Card>
        <Card title="Declared supply chains">
          <div className="overflow-hidden rounded-lg">
            <MapLeaflet paths={paths} basemap="dark" height={420} />
          </div>
        </Card>
      </div>

      {/* company table */}
      <Card title={`Declared companies (${companies.length})`} className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="py-2 pr-3">Company</th>
                <th className="py-2 pr-3">Origin</th>
                <th className="py-2 pr-3">Overall</th>
                <th className="py-2 pr-3">Verdict</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3 font-semibold text-navy">
                    {c.company}
                  </td>
                  <td className="py-2 pr-3 text-slate-600">
                    {c.origin_mine}, {c.origin_country}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded bg-slate-100">
                        <div
                          className="h-1.5 rounded"
                          style={{
                            width: `${c.overall * 100}%`,
                            background: band(c.overall),
                          }}
                        />
                      </div>
                      <span className="font-semibold" style={{ color: band(c.overall) }}>
                        {c.overall}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      style={{ background: VERDICT_COLORS[c.verdict] }}
                    >
                      {c.verdict}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <Link
                      href={`/company/${c.id}`}
                      className="font-semibold text-teal hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
