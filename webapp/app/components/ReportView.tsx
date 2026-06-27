"use client";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CompanyDetail, MineralSummary } from "@/lib/types";
import { MINERAL_LABEL, VERDICT_COLORS, band } from "./constants";
import { MineralIcon } from "./icons";
import { AUTHORS, INSTITUTION, COURSE } from "@/lib/site";
import ScoreGauge from "./ScoreGauge";
import Sparkbar from "./Sparkbar";

const RLAB: Record<string, string> = {
  geology: "Geological consistency",
  distance: "Geographic feasibility",
  structure: "Network completeness",
  ndvi: "Remote sensing (NDVI)",
  responsible: "Responsible sourcing (CAHRA + LBMA)",
};

export default function ReportView({
  company: c,
  mineral,
  date,
}: {
  company: CompanyDetail;
  mineral: MineralSummary;
  date: string;
}) {
  const chainText = c.chain.map((n) => n.node_name).join("  →  ");
  const nd = c.ndvi;
  return (
    <div className="report-page mx-auto my-6 max-w-4xl rounded-xl bg-white p-10 shadow-sm">
      {/* toolbar (hidden when printing) */}
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href={`/company/${c.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-teal"
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {/* cover */}
      <header
        className="flex items-start justify-between gap-4 border-b-4 pb-4"
        style={{ borderColor: c.color }}
      >
        <div className="flex items-start gap-3">
          <span
            className="grid h-12 w-12 place-items-center rounded-xl text-white"
            style={{ background: c.color }}
          >
            <MineralIcon mineral={c.mineral} className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Supply-Chain Compliance &amp; Plausibility Report
            </p>
            <h1 className="text-3xl font-extrabold text-navy">{c.company}</h1>
            <p className="text-sm text-slate-600">
              {MINERAL_LABEL[c.mineral]} · {c.regime}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-4 py-2 text-base font-extrabold text-white"
          style={{ background: VERDICT_COLORS[c.verdict] }}
        >
          {c.overall} · {c.verdict}
        </span>
      </header>
      <p className="mt-2 text-xs text-slate-500">
        Prepared by <b>{AUTHORS}</b> · {COURSE} · {INSTITUTION} · {date}
      </p>

      {/* 1 — chain */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal">
          1 · Company &amp; declared supply chain
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          {c.company} ({c.declarant_country}) declares the following{" "}
          {MINERAL_LABEL[c.mineral]} supply-chain path, assessed here against the
          geospatial plausibility rules.
        </p>
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-navy">
          {chainText}
        </p>
        <table className="mt-3 w-full text-left text-xs">
          <thead>
            <tr className="uppercase text-slate-400">
              <th className="py-1 pr-3">Tier</th>
              <th className="py-1 pr-3">Node</th>
              <th className="py-1 pr-3">Operator</th>
              <th className="py-1 pr-3">Country</th>
              <th className="py-1 pr-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {c.chain.map((n, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="py-1 pr-3 font-semibold text-slate-500">
                  {n.tier}
                </td>
                <td className="py-1 pr-3 font-semibold text-navy">
                  {n.node_name}
                </td>
                <td className="py-1 pr-3">{n.company}</td>
                <td className="py-1 pr-3">{n.country}</td>
                <td className="py-1 pr-3 text-slate-500">
                  {n.source_url?.startsWith("http") ? (
                    <a href={n.source_url} className="text-teal underline">
                      {n.source_type || "source"}
                    </a>
                  ) : (
                    n.source_type
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 2 — scorecard */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal">
          2 · Plausibility scorecard
        </h2>
        <div className="mt-2 flex items-center gap-6">
          <ScoreGauge value={c.overall} verdict={c.verdict} />
          <div className="flex-1">
            <Sparkbar scores={c.scores} />
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          PASS ≥ 0.8 · WARN ≥ 0.5 · FAIL &lt; 0.5 · overall = average of rules (
          {Object.keys(c.scores)
            .map((k) => RLAB[k] || k)
            .join(", ")}
          ).
        </p>
      </section>

      {/* gold rule 5 */}
      {c.cahra && (
        <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <b className="text-navy">Rule 5 — Responsible sourcing.</b> Origin{" "}
          {nd.mine} CAHRA status:{" "}
          <span
            className="rounded px-1.5 py-0.5 text-xs font-bold text-white"
            style={{
              background:
                c.cahra === "no"
                  ? "#2E7D32"
                  : c.cahra === "partial"
                    ? "#E08A1E"
                    : "#C0392B",
            }}
          >
            {c.cahra}
          </span>{" "}
          · refiner LBMA/RMI accredited → high-risk origin mitigated, not failed.
        </section>
      )}

      {/* 3 — NDVI */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal">
          3 · Satellite evidence — {nd.mine}
        </h2>
        {nd.thumb && (
          <img
            src={`/data/${nd.thumb}`}
            alt={`NDVI ${nd.mine}`}
            className="mt-2 w-full rounded-lg border border-slate-100"
          />
        )}
        <p className="mt-1 text-sm">
          Sentinel-2 NDVI at the mine:{" "}
          <b style={{ color: band(nd.value ?? 0.4) }}>
            {nd.value ?? "—"} ({nd.verdict})
          </b>{" "}
          <span className="text-slate-500">· Copernicus, cached composite</span>
        </p>
      </section>

      {/* 4 — market context */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal">
          4 · Market context — {MINERAL_LABEL[c.mineral]} production
        </h2>
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="uppercase text-slate-400">
              <th className="py-1 pr-3">Country</th>
              <th className="py-1 pr-3 text-right">Production (t)</th>
              <th className="py-1 pr-3 text-right">World share</th>
            </tr>
          </thead>
          <tbody>
            {mineral.production.slice(0, 8).map((p, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="py-1 pr-3 font-semibold text-navy">{p.country}</td>
                <td className="py-1 pr-3 text-right">
                  {p.value.toLocaleString()}
                </td>
                <td className="py-1 pr-3 text-right">{p.share}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-slate-500">
          World total {mineral.world_total.toLocaleString()} t · Source:{" "}
          {mineral.prod_source} ({mineral.prod_page}).
        </p>
      </section>

      {/* conclusion */}
      <section className="mt-6 border-t border-slate-200 pt-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal">
          Conclusion
        </h2>
        <p className="mt-1 text-sm text-slate-700">
          {c.company}&apos;s declared {MINERAL_LABEL[c.mineral]} path is assessed{" "}
          <b style={{ color: VERDICT_COLORS[c.verdict] }}>
            {c.verdict} (overall {c.overall})
          </b>{" "}
          on the geospatial plausibility framework. This is a risk-triage signal
          for due diligence, not legal certification.
        </p>
        <p className="mt-3 text-[10px] text-slate-400">
          Sources: USGS MCS 2025 · Mindat · UN Comtrade · Copernicus/ESA
          Sentinel-2 (STAC) · OpenStreetMap · EUR-Lex. Prepared by {AUTHORS},{" "}
          {INSTITUTION}. Plausibility, not proof.
        </p>
      </section>
    </div>
  );
}
