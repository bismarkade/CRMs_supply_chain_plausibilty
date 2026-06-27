# CRM Supply-Chain Plausibility — Web App

Interactive viewer for the critical raw-material supply-chain plausibility
assessment (Lithium · Rare Earths · Gold). Next.js (TS) frontend + thin FastAPI
backend, deployed together on Vercel. **All geospatial / NDVI processing is
offline** — the app only reads precomputed artifacts.

## Architecture
```
OFFLINE (rare)                         DEPLOYED ON VERCEL (fast)
notebooks + cs_data + Sentinel-2  ──▶  Next.js (Leaflet · React Flow · Recharts)
 pipeline/build_data.py  emits          api/index.py  (FastAPI, reads JSON only)
 public/data/*.json + GeoJSON + assets  CDN serves immutable artifacts
```
NDVI is **never** recomputed at request time — `build_data.py` reads
`reports/_assets/<mineral>/ndvi.csv` (cached). Re-running NDVI is a manual
offline step.

## Data contract (`public/data/`)
- `manifest.json` — version hash + counts
- `minerals.json` — per mineral: uses, regulation, production, verdict tallies
- `companies.json` — all 15 declared paths (id, mineral, verdict, overall)
- `company/<mineral>__<Company>.json` — chain, scores, KG, NDVI (value+bounds), pdf
- `geojson/<mineral>.geojson`, `all.geojson` — points + chain lines for Leaflet
- `assets/ndvi/*.png`, `assets/pdf/*.pdf` — binaries (→ Vercel Blob for deploy)

## Develop
```bash
# 1. (re)build the data contract from the repo's cs_data/reports  (run from repo root)
crm_sc_venv/bin/python webapp/pipeline/build_data.py

# 2. frontend
cd webapp
npm install
npm run dev            # http://localhost:3000

# 3. backend (local FastAPI, optional during dev)
crm_sc_venv/bin/pip install -r api/requirements.txt
crm_sc_venv/bin/uvicorn api.index:app --reload --port 8000
```

## Deploy (Vercel)
- Set **Root Directory = `webapp`** in the Vercel project.
- `vercel.json` routes `/api/*` → the Python function; everything else → Next.js.
- Large binaries (`assets/`) are gitignored; upload to **Vercel Blob** (token:
  `BLOB_READ_WRITE_TOKEN`) — wiring added in a later phase.

## Status
- [x] **Phase 0** — data pipeline + contract + skeleton (this commit)
- [ ] Phase 1 — layout, mineral filter, shadcn styling
- [ ] Phase 2 — dashboard Leaflet map + filters
- [ ] Phase 3 — company detail (KG, map, gauge/sparkbar, NDVI overlay, PDF)
- [ ] Phase 4 — mineral pages (treemap/choropleth)
- [ ] Phase 5 — FastAPI wired + Blob + caching headers
