export type Verdict = "PASS" | "WARN" | "FAIL";

export interface MineralSummary {
  key: string;
  label: string;
  tag: string;
  color: string;
  uses: string[];
  regulation: string[];
  regime: string;
  companies: string[];
  production: { country: string; value: number; share: number }[];
  top_country: string;
  top_share: number;
  crma_fail: boolean;
  verdicts: { PASS: number; WARN: number; FAIL: number };
}

export interface CompanyListItem {
  id: string;
  mineral: string;
  mineral_label: string;
  company: string;
  origin_mine: string;
  origin_country: string;
  overall: number;
  verdict: Verdict;
}

export interface ChainNode {
  tier: string;
  node_name: string;
  node_type: string;
  company: string;
  country: string;
  lat: number;
  lon: number;
  source_document: string;
  source_url: string;
  source_type: string;
  confidence: string;
}

export interface CompanyDetail {
  id: string;
  mineral: string;
  mineral_label: string;
  company: string;
  declarant_country: string;
  regime: string;
  tag: string;
  color: string;
  overall: number;
  verdict: Verdict;
  scores: Record<string, number>;
  chain: ChainNode[];
  kg: {
    nodes: { id: string; label: string; tier: number; kind: string; sub: string }[];
    edges: { source: string; target: string; kind: string }[];
  };
  ndvi: {
    mine: string;
    value: number | null;
    verdict: string;
    thumb: string;
    center: [number, number];
    bounds: [[number, number], [number, number]];
  };
  pdf: string;
  cahra?: string;
}

export const bandClass = (v: number) =>
  v >= 0.8 ? "good" : v >= 0.5 ? "warn" : "poor";
