export const TIER_COLORS: Record<string, string> = {
  Mining: "#E15759",
  Processing: "#F28E2B",
  Refining: "#F28E2B",
  Manufacturing: "#4E79A7",
};
export const VERDICT_COLORS: Record<string, string> = {
  PASS: "#2E7D32",
  WARN: "#E08A1E",
  FAIL: "#C0392B",
};
export const MINERAL_LABEL: Record<string, string> = {
  lithium: "Lithium",
  rare_earths: "Rare Earths",
  gold: "Gold",
};
export const MINERAL_COLOR: Record<string, string> = {
  lithium: "#2A7DB5",
  rare_earths: "#1B9AAA",
  gold: "#C8922A",
};
export const band = (v: number) =>
  v >= 0.8 ? "#2E7D32" : v >= 0.5 ? "#E08A1E" : "#C0392B";
export const safeId = (mineral: string, company: string) =>
  `${mineral}__${company.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
