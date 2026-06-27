"use client";
import "leaflet/dist/leaflet.css";
import { useState, Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Tooltip,
  Popup,
} from "react-leaflet";
import Link from "next/link";
import { TIER_COLORS, VERDICT_COLORS } from "./constants";
import { arc, spread } from "./arc";
import { tierIcon, cahraIcon, TIER_LUCIDE } from "./markerIcons";

const BASEMAPS: Record<string, { url: string; dark: boolean }> = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    dark: true,
  },
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    dark: false,
  },
};
const CAHRA_COLOR: Record<string, string> = {
  yes: "#C0392B",
  partial: "#E08A1E",
};

export default function MapLeaflet({
  paths,
  height = 480,
  basemap = "dark",
  legend = true,
}: {
  paths: any[];
  height?: number;
  basemap?: "dark" | "voyager";
  legend?: boolean;
}) {
  const bm = BASEMAPS[basemap];
  const hasCahra = paths.some((p) => p.cahra && p.cahra !== "no");
  const [conflict, setConflict] = useState(true);

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={[20, 10]}
        zoom={2}
        minZoom={2}
        worldCopyJump
        style={{ height, width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer attribution="&copy; OpenStreetMap, &copy; CARTO" url={bm.url} />
        {paths.map((p) => {
          const coords = p.nodes.map(
            (n: any) => [n.lat, n.lon] as [number, number],
          );
          const disp = spread(coords, 0.7);
          const color = VERDICT_COLORS[p.verdict] || "#888";
          return (
            <Fragment key={p.id}>
              {/* arcs (glow + animated flow) between consecutive nodes */}
              {disp.slice(0, -1).map((c, i) => {
                const cv = arc(c, disp[i + 1]);
                return (
                  <Fragment key={i}>
                    <Polyline
                      positions={cv}
                      pathOptions={{ color, weight: 6, opacity: 0.12 }}
                      interactive={false}
                    />
                    <Polyline
                      positions={cv}
                      pathOptions={{
                        color,
                        weight: 2,
                        opacity: 0.9,
                        dashArray: "6 14",
                        className: "flow-line",
                      }}
                      interactive={false}
                    />
                  </Fragment>
                );
              })}
              {/* conflict (CAHRA): bold ring + warning badge on the mine */}
              {conflict && p.cahra && p.cahra !== "no" && (
                <Fragment>
                  <CircleMarker
                    center={disp[0]}
                    radius={30}
                    pathOptions={{
                      color: CAHRA_COLOR[p.cahra],
                      weight: 2.5,
                      fillColor: CAHRA_COLOR[p.cahra],
                      fillOpacity: 0.22,
                    }}
                  >
                    <Tooltip>CAHRA risk: {p.cahra}</Tooltip>
                  </CircleMarker>
                  <Marker
                    position={disp[0]}
                    icon={cahraIcon(p.cahra)}
                    interactive={false}
                  />
                </Fragment>
              )}
              {/* node markers */}
              {p.nodes.map((n: any, i: number) => (
                <Marker key={i} position={disp[i]} icon={tierIcon(n.tier)}>
                  <Tooltip>
                    {n.node_name} — {n.tier}
                  </Tooltip>
                  <Popup maxWidth={300}>
                    <b>{n.node_name}</b>
                    <br />
                    {n.tier} · {n.country}
                    <br />
                    {n.company}
                    {n.tier === "Mining" && n.thumb && (
                      <>
                        <img
                          src={`/data/${n.thumb}`}
                          alt={`NDVI ${n.node_name}`}
                          style={{
                            width: "100%",
                            marginTop: 6,
                            borderRadius: 6,
                          }}
                        />
                        <div style={{ fontSize: 11, marginTop: 2 }}>
                          NDVI {n.ndvi} ({n.ndvi_verdict})
                          {n.cahra ? ` · CAHRA: ${n.cahra}` : ""}
                        </div>
                      </>
                    )}
                    <br />
                    <Link href={`/company/${p.id}`}>View company →</Link>
                  </Popup>
                </Marker>
              ))}
            </Fragment>
          );
        })}
      </MapContainer>

      {/* conflict toggle */}
      {hasCahra && (
        <label className="absolute right-3 top-3 z-[500] flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-100 shadow-lg">
          <input
            type="checkbox"
            checked={conflict}
            onChange={(e) => setConflict(e.target.checked)}
            className="accent-rose-500"
          />
          Conflict (CAHRA) layer
        </label>
      )}

      {legend && (
        <div
          className={`pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg px-3 py-2 text-xs shadow-lg ${
            bm.dark ? "bg-slate-900/80 text-slate-100" : "bg-white/90 text-ink"
          }`}
        >
          <div className="mb-1 font-bold">Tiers</div>
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
          <div className="mb-1 mt-2 font-bold">Verdict (path)</div>
          {["PASS", "WARN", "FAIL"].map((v) => (
            <div key={v} className="flex items-center gap-2">
              <span
                className="inline-block h-1 w-4 rounded"
                style={{ background: VERDICT_COLORS[v] }}
              />
              {v}
            </div>
          ))}
          {hasCahra && (
            <>
              <div className="mb-1 mt-2 font-bold">Conflict (CAHRA) ⚠</div>
              {[
                ["yes", "high-risk"],
                ["partial", "partial"],
              ].map(([c, lbl]) => (
                <div key={c} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: CAHRA_COLOR[c] }}
                  />
                  {lbl}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
