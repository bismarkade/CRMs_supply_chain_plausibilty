"use client";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Pickaxe,
  Factory,
  Building2,
  MapPin,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { TIER_COLORS } from "./constants";

const ICON: Record<string, LucideIcon> = {
  Mining: Pickaxe,
  Processing: Factory,
  Refining: Factory,
  Manufacturing: Building2,
};

// for legends (React render)
export const TIER_LUCIDE: Record<string, LucideIcon> = {
  Mining: Pickaxe,
  Processing: Factory,
  Manufacturing: Building2,
};

const cache: Record<string, L.DivIcon> = {};

export function tierIcon(tier: string): L.DivIcon {
  if (cache[tier]) return cache[tier];
  const Icon = ICON[tier] || MapPin;
  const color = TIER_COLORS[tier] || "#64748b";
  const svg = renderToStaticMarkup(
    <Icon size={15} color="#ffffff" strokeWidth={2.4} />,
  );
  const html = `<div class="tier-pin" style="--c:${color}">${svg}</div>`;
  cache[tier] = L.divIcon({
    className: "",
    html,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
  return cache[tier];
}

// conflict (CAHRA) warning badge — sits above the mine pin
export function cahraIcon(level: string): L.DivIcon {
  const k = `cahra-${level}`;
  if (cache[k]) return cache[k];
  const color = level === "yes" ? "#C0392B" : "#E08A1E";
  const svg = renderToStaticMarkup(
    <AlertTriangle size={13} color="#ffffff" strokeWidth={2.6} />,
  );
  const html = `<div style="display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 8px ${color}">${svg}</div>`;
  cache[k] = L.divIcon({
    className: "",
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 34],
  });
  return cache[k];
}
