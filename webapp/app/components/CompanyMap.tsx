"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import { TIER_COLORS, VERDICT_COLORS } from "./constants";
import { arc, spread } from "./arc";
import { tierIcon, TIER_LUCIDE } from "./markerIcons";
import type { ChainNode } from "@/lib/types";

function FitBounds({ pts }: { pts: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (pts.length) map.fitBounds(pts as any, { padding: [55, 55] });
  }, [map, pts]);
  return null;
}

export default function CompanyMap({
  chain,
  verdict,
  mine,
  height = 360,
}: {
  chain: ChainNode[];
  verdict: string;
  mine?: { thumb: string; value: number | null; verdict: string; cahra?: string };
  height?: number;
}) {
  const pts = spread(
    chain.map((c) => [c.lat, c.lon] as [number, number]),
    0.55,
  );
  const color = VERDICT_COLORS[verdict] || "#1B9AAA";
  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={pts[0] || [15, 10]}
        zoom={3}
        style={{ height, width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap, &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {pts.slice(0, -1).map((p, i) => {
          const curve = arc(p, pts[i + 1]);
          return (
            <Fragment key={i}>
              <Polyline
                positions={curve}
                pathOptions={{ color, weight: 8, opacity: 0.14 }}
                interactive={false}
              />
              <Polyline
                positions={curve}
                pathOptions={{
                  color,
                  weight: 3,
                  opacity: 0.95,
                  dashArray: "6 14",
                  className: "flow-line",
                }}
                interactive={false}
              />
            </Fragment>
          );
        })}
        {mine?.cahra && mine.cahra !== "no" && (
          <CircleMarker
            center={pts[0]}
            radius={18}
            pathOptions={{
              color: mine.cahra === "yes" ? "#C0392B" : "#E08A1E",
              weight: 2,
              fillColor: mine.cahra === "yes" ? "#C0392B" : "#E08A1E",
              fillOpacity: 0.15,
            }}
          >
            <Tooltip>CAHRA: {mine.cahra}</Tooltip>
          </CircleMarker>
        )}
        {chain.map((c, i) => (
          <Marker key={i} position={pts[i]} icon={tierIcon(c.tier)}>
            <Tooltip>{c.node_name}</Tooltip>
            <Popup maxWidth={300}>
              <b>{c.node_name}</b>
              <br />
              {c.tier} · {c.country}
              <br />
              {c.company}
              {c.tier === "Mining" && mine?.thumb && (
                <>
                  <img
                    src={`/data/${mine.thumb}`}
                    alt={`NDVI ${c.node_name}`}
                    style={{ width: "100%", marginTop: 6, borderRadius: 6 }}
                  />
                  <div style={{ fontSize: 11, marginTop: 2 }}>
                    NDVI {mine.value} ({mine.verdict})
                    {mine.cahra ? ` · CAHRA: ${mine.cahra}` : ""}
                  </div>
                </>
              )}
            </Popup>
          </Marker>
        ))}
        <FitBounds pts={pts} />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-slate-100 shadow-lg">
        {["Mining", "Processing", "Manufacturing"].map((t) => {
          const I = TIER_LUCIDE[t];
          return (
            <div key={t} className="flex items-center gap-2">
              <span
                className="grid h-4 w-4 place-items-center rounded-full text-white"
                style={{ background: TIER_COLORS[t] }}
              >
                <I className="h-2.5 w-2.5" />
              </span>
              {t}
            </div>
          );
        })}
      </div>
    </div>
  );
}
