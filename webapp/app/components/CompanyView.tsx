"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CompanyDetail } from "@/lib/types";
import { MINERAL_LABEL, MINERAL_COLOR, VERDICT_COLORS, band } from "./constants";
import { AUTHORS } from "@/lib/site";
import { MineralIcon } from "./icons";
import ScoreGauge from "./ScoreGauge";
import Sparkbar from "./Sparkbar";

const KnowledgeGraph = dynamic(() => import("./KnowledgeGraph"), {
  ssr: false,
  loading: () => <div className="h-[240px] rounded-xl bg-slate-100" />,
});
const CompanyMap = dynamic(() => import("./CompanyMap"), {
  ssr: false,
  loading: () => <div className="h-[320px] rounded-xl bg-slate-100" />,
});

const Card = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
  >
    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-teal">
      {title}
    </h3>
    {children}
  </section>
);

export default function CompanyView({ data }: { data: CompanyDetail }) {
  const chainText = data.chain.map((c) => c.node_name).join(" → ");
  const nd = data.ndvi;
  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <Link href="/" className="text-sm font-semibold text-teal hover:underline">
        ← Back to overview
      </Link>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow"
            style={{ background: MINERAL_COLOR[data.mineral] }}
          >
            <MineralIcon mineral={data.mineral} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {MINERAL_LABEL[data.mineral]} · use case
            </p>
            <h1 className="text-3xl font-extrabold text-navy">{data.company}</h1>
            <p className="mt-1 text-sm text-slate-600">{chainText}</p>
            <p className="text-xs text-slate-400">{data.regime}</p>
          </div>
        </div>
        <span
          className="rounded-full px-4 py-2 text-lg font-extrabold text-white"
          style={{ background: VERDICT_COLORS[data.verdict] }}
        >
          {data.overall} · {data.verdict}
        </span>
      </header>

      {/* knowledge graph */}
      <div className="mt-5">
        <Card title="Knowledge graph — declared chain">
          <KnowledgeGraph nodes={data.kg.nodes} edges={data.kg.edges} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* map */}
        <Card title="Supply-chain map — declared path">
          <CompanyMap
            chain={data.chain}
            verdict={data.verdict}
            mine={{
              thumb: nd.thumb,
              value: nd.value,
              verdict: nd.verdict,
              cahra: data.cahra,
            }}
          />
        </Card>

        {/* scorecard */}
        <Card title="Plausibility scorecard">
          <div className="flex items-center gap-5">
            <ScoreGauge value={data.overall} verdict={data.verdict} />
            <div className="flex-1">
              <Sparkbar scores={data.scores} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            PASS ≥ 0.8 · WARN ≥ 0.5 · FAIL &lt; 0.5 · overall = average of rules
          </p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* NDVI */}
        <Card title={`Satellite NDVI — ${nd.mine}`}>
          {nd.thumb ? (
            <img
              src={`/data/${nd.thumb}`}
              alt={`NDVI ${nd.mine}`}
              className="w-full rounded-lg border border-slate-100"
            />
          ) : (
            <div className="grid h-40 place-items-center text-slate-400">
              no imagery
            </div>
          )}
          <p className="mt-2 text-sm">
            NDVI{" "}
            <b style={{ color: band(nd.value ?? 0.4) }}>
              {nd.value ?? "—"} ({nd.verdict})
            </b>{" "}
            <span className="text-slate-500">
              · Sentinel-2 (Copernicus, cached)
            </span>
          </p>
        </Card>

        {/* finding + cahra + pdf */}
        <Card title="Findings & report">
          {data.cahra && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <b className="text-navy">Rule 5 — Responsible sourcing.</b> Origin{" "}
              {nd.mine} CAHRA status:{" "}
              <span
                className="rounded px-1.5 py-0.5 text-xs font-bold text-white"
                style={{
                  background:
                    data.cahra === "no"
                      ? "#2E7D32"
                      : data.cahra === "partial"
                        ? "#E08A1E"
                        : "#C0392B",
                }}
              >
                {data.cahra}
              </span>{" "}
              · refiner LBMA/RMI accredited → high-risk origin mitigated.
            </div>
          )}
          <p className="text-sm text-slate-600">
            Declarant: <b>{data.declarant_country}</b>. This declared{" "}
            {MINERAL_LABEL[data.mineral]} path was tested against the geospatial
            plausibility rules; see the full compliance report below.
          </p>
          <a
            href={`/company/${data.id}/report`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-teal"
          >
            ↗ Open compliance report
          </a>
        </Card>
      </div>

      {/* sources */}
      <Card title="Declared chain — nodes & sources" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="py-1 pr-3">Tier</th>
                <th className="py-1 pr-3">Node</th>
                <th className="py-1 pr-3">Operator</th>
                <th className="py-1 pr-3">Country</th>
                <th className="py-1 pr-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {data.chain.map((c, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-1.5 pr-3 font-semibold text-slate-500">
                    {c.tier}
                  </td>
                  <td className="py-1.5 pr-3 font-semibold text-navy">
                    {c.node_name}
                  </td>
                  <td className="py-1.5 pr-3">{c.company}</td>
                  <td className="py-1.5 pr-3">{c.country}</td>
                  <td className="py-1.5 pr-3 text-xs text-slate-500">
                    {c.source_url?.startsWith("http") ? (
                      <a
                        href={c.source_url}
                        target="_blank"
                        className="text-teal hover:underline"
                      >
                        {c.source_type || "source"}
                      </a>
                    ) : (
                      c.source_type
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <footer className="mt-8 text-xs text-slate-400">
        Plausibility, not proof — a geospatial risk-triage signal. {AUTHORS}.
      </footer>
    </main>
  );
}
