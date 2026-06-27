import fs from "fs";
import path from "path";
import type { MineralSummary, CompanyListItem, CompanyDetail } from "./types";

const DATA = path.join(process.cwd(), "public", "data");
const read = <T>(rel: string): T =>
  JSON.parse(fs.readFileSync(path.join(DATA, rel), "utf8")) as T;

export const getMinerals = () => read<MineralSummary[]>("minerals.json");
export const getCompanies = () => read<CompanyListItem[]>("companies.json");
export const getCompany = (id: string) =>
  read<CompanyDetail>(`company/${id}.json`);
export const getManifest = () =>
  read<{ version: string; minerals: number; companies: number }>(
    "manifest.json",
  );
export const getGeo = (mineral = "all") =>
  read<{ type: string; features: any[] }>(`geojson/${mineral}.geojson`).features;
export const getPaths = (mineral = "all") => {
  const all = read<any[]>("paths.json");
  return mineral === "all" ? all : all.filter((p) => p.mineral === mineral);
};
