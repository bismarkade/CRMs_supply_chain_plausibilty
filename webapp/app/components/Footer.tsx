import { AUTHORS, INSTITUTION } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-6 py-8 text-xs text-slate-400">
      Plausibility, not proof — a geospatial risk-triage signal. {AUTHORS} ·{" "}
      {INSTITUTION}.
    </footer>
  );
}
