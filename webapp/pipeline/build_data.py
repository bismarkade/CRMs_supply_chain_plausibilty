"""Phase 0 — offline data pipeline.
Reads cs_data + results.csv + ndvi.csv (+ existing report PDFs / NDVI thumbnails)
and emits the web app's static data contract into webapp/public/data/.
NDVI is NEVER recomputed here — it is read from ndvi.csv + cached thumbnails.
Run:  crm_sc_venv/bin/python webapp/pipeline/build_data.py
"""

import json
import math
import os
import re
import shutil

import pandas as pd

ROOT = "."  # repo root (run from there)
OUT = "webapp/public/data"
ASSET_NDVI = f"{OUT}/assets/ndvi"
for d in (OUT, f"{OUT}/company", f"{OUT}/geojson", ASSET_NDVI):
    os.makedirs(d, exist_ok=True)


def safe(s):
    return re.sub(r"[^A-Za-z0-9]+", "_", str(s)).strip("_")


TIER = {"Mining": 0, "Processing": 1, "Refining": 1, "Manufacturing": 2}
TIERLBL = {0: "Mining", 1: "Processing", 2: "Manufacturing"}

MIN = {
    "lithium": dict(
        folder="Lithium_ds",
        label="Lithium",
        flabel="Lithium",
        color="#2A7DB5",
        tag="Battery metal — the electrification backbone",
        uses=[
            "Cathodes for lithium-ion batteries — EVs & grid storage",
            "Core enabler of the EU energy transition",
            "Demand projected to grow several-fold by 2030",
        ],
        reg=[
            "EU Battery Regulation 2023/1542 — supply-chain due diligence + digital battery passport (from 2027)",
            "Critical Raw Materials Act 2024/1252 — strategic material; ≤ 65% from any one third country",
        ],
        regime="EU Battery Regulation 2023/1542 · Critical Raw Materials Act 2024/1252",
    ),
    "rare_earths": dict(
        folder="Rare_Earth_Elements_ds",
        label="Rare Earths",
        flabel="Rare_Earth",
        color="#1B9AAA",
        tag="Magnet metals — wind turbines & EV motors",
        uses=[
            "Permanent magnets (NdFeB) for wind generators & EV traction motors",
            "Electronics, optics, defence",
            "Few viable substitutes — critical to the green transition",
        ],
        reg=[
            "Critical Raw Materials Act 2024/1252 — strategic; severe single-country concentration",
            "China ≈ 69% of mining & ≈ 90% of refining → CRMA > 65% breach + export-control exposure",
        ],
        regime="Critical Raw Materials Act 2024/1252 · China export-control exposure",
    ),
    "gold": dict(
        folder="Gold_ds",
        label="Gold",
        flabel="Gold",
        color="#C8922A",
        tag="Conflict-sensitive — origins & refiners",
        uses=[
            "Electronics (bonding wire, connectors), jewellery",
            "Investment & central-bank reserves",
            "High value-density → long, opaque chains",
        ],
        reg=[
            "EU Conflict Minerals Regulation 2017/821 (3TG) — OECD 5-step due diligence on CAHRA sourcing",
            "LBMA Good Delivery / RMI refiner accreditation — basis of our added Rule 5",
        ],
        regime="EU Conflict Minerals Regulation 2017/821 · OECD · LBMA",
    ),
}


def verdict(v):
    return "PASS" if v >= 0.8 else "WARN" if v >= 0.5 else "FAIL"


def ndvi_bounds(lat, lon, km=8.0):
    dlat = km / 111.0
    dlon = km / (111.0 * max(0.2, math.cos(math.radians(lat))))
    return [
        [round(lat - dlat, 5), round(lon - dlon, 5)],
        [round(lat + dlat, 5), round(lon + dlon, 5)],
    ]


# USGS MCS 2025 world mine-production totals + the "Other countries" residual
# (verified against the per-commodity tables): lithium p.111, REE p.145, gold p.83
WORLD = {
    "lithium": (240000, 0),
    "rare_earths": (390000, 1100),
    "gold": (3300, 780),
}

minerals_out = []
companies_out = []
paths_out = []
for key, m in MIN.items():
    folder = m["folder"]
    ds = f"cs_data/{folder}"
    master = pd.read_csv(f"{ds}/supply_chain.csv").rename(
        columns={"lat": "latitude", "lon": "longitude"}
    )
    if key == "gold":
        master["tier"] = master["tier"].replace({"Refining": "Processing"})
    res = pd.read_csv(f"reports/_assets/{key}/results.csv")
    tf = pd.read_csv(f"{ds}/trade_flows.csv")
    ndvi = {}
    for _, nr in pd.read_csv(f"reports/_assets/{key}/ndvi.csv").iterrows():
        ndvi[str(nr["mine"])] = (float(nr["ndvi"]), str(nr["verdict"]))
    cahra = {}
    if key == "gold":
        geo = pd.read_csv(f"{ds}/geological.csv")
        cahra = dict(zip(geo.country, geo.cahra_flag))
    geo_bounds = {}
    gb_path = f"reports/_assets/{key}/ndvi_geo/bounds.json"
    if os.path.exists(gb_path):
        geo_bounds = json.load(open(gb_path))
    prod = tf[tf.metric == "mine_production"].sort_values(
        "value", ascending=False
    )
    production = [
        dict(
            country=r.country,
            value=int(r.value),
            share=float(r.world_share_pct),
        )
        for _, r in prod.iterrows()
    ]
    world_total, other = WORLD[key]
    if other > 0:
        production.append(
            dict(
                country="Other countries",
                value=int(other),
                share=round(other / world_total * 100, 1),
            )
        )
    prod_source = str(prod.iloc[0]["source"])
    prod_page = str(prod.iloc[0]["source_ref"])
    topc = prod.iloc[0]
    gej_features = []
    companies_meta = []
    for _, rr in res.iterrows():
        company = (
            rr["path"].split(" ", 1)[1] if " " in rr["path"] else rr["path"]
        )
        pid = int(rr["path"].split()[0][1:])
        p = master[master.path_id == pid].copy()
        p["o"] = p.tier.map(TIER)
        p = p.sort_values("o")
        mine_row = p[p.tier == "Mining"].iloc[0]
        mine = mine_row["node_name"]
        mcty = mine_row["country"]
        ov = float(rr["overall"])
        vd = str(rr["verdict"])
        scorecols = [
            c
            for c in ["geology", "distance", "structure", "ndvi", "responsible"]
            if c in res.columns
        ]
        scores = {c: float(rr[c]) for c in scorecols}
        nv, nvv = ndvi.get(mine, (None, "—"))
        # chain nodes
        chain = []
        for _, nr in p.iterrows():
            chain.append(
                dict(
                    tier=nr["tier"],
                    node_name=nr["node_name"],
                    node_type=nr.get("node_type", ""),
                    company=nr.get("company", ""),
                    country=nr.get("country", ""),
                    lat=float(nr["latitude"]),
                    lon=float(nr["longitude"]),
                    source_document=str(nr.get("claim_source_document", "")),
                    source_url=str(nr.get("claim_source_url", "")),
                    source_type=str(nr.get("source_type", "")),
                    confidence=str(nr.get("confidence", "")),
                )
            )
        # knowledge graph (origin country -> chain tiers)
        kg_nodes = [
            dict(
                id="origin",
                label=mcty,
                tier=-1,
                kind="country",
                sub="origin country",
            )
        ]
        kg_edges = []
        prev = "origin"
        for i, c in enumerate(chain):
            nid = f"n{i}"
            kg_nodes.append(
                dict(
                    id=nid,
                    label=c["node_name"],
                    tier=TIER.get(c["tier"], 1),
                    kind=c["tier"],
                    sub=f"{c['company']} · {c['country']}".strip(" ·"),
                )
            )
            kg_edges.append(
                dict(
                    source=prev,
                    target=nid,
                    kind=(
                        "located_in" if prev == "origin" else "material_flow"
                    ),
                )
            )
            prev = nid
        # geojson: points + path line
        coords = []
        for c in chain:
            coords.append([c["lon"], c["lat"]])
            gej_features.append(
                dict(
                    type="Feature",
                    geometry=dict(
                        type="Point", coordinates=[c["lon"], c["lat"]]
                    ),
                    properties=dict(
                        mineral=key,
                        path_id=pid,
                        company=company,
                        tier=c["tier"],
                        node=c["node_name"],
                        country=c["country"],
                        verdict=vd,
                        overall=ov,
                    ),
                )
            )
        gej_features.append(
            dict(
                type="Feature",
                geometry=dict(type="LineString", coordinates=coords),
                properties=dict(
                    mineral=key,
                    path_id=pid,
                    company=company,
                    verdict=vd,
                    overall=ov,
                    kind="chain",
                ),
            )
        )
        # copy NDVI thumb + PDF
        thumb_src = f"{ds}/outputs/ndvi_thumb_{mine.split()[0]}.png"
        thumb_rel = ""
        if os.path.exists(thumb_src):
            shutil.copy(thumb_src, f"{ASSET_NDVI}/{key}_{safe(company)}.png")
            thumb_rel = f"assets/ndvi/{key}_{safe(company)}.png"
        # georeferenced NDVI raster (for the Leaflet ImageOverlay), if exported
        geo_src = f"reports/_assets/{key}/ndvi_geo/{safe(mine)}.png"
        geo_rel = ""
        geo_bnd = None
        if os.path.exists(geo_src):
            shutil.copy(geo_src, f"{ASSET_NDVI}/geo_{key}_{safe(mine)}.png")
            geo_rel = f"assets/ndvi/geo_{key}_{safe(mine)}.png"
            geo_bnd = geo_bounds.get(safe(mine))
        pdf_rel = ""  # static PDFs replaced by the on-the-fly /report page
        cid = f"{key}__{safe(company)}"
        cobj = dict(
            id=cid,
            mineral=key,
            mineral_label=m["label"],
            company=company,
            declarant_country=str(p.iloc[0].get("declarant_country", "")),
            regime=m["regime"],
            tag=m["tag"],
            color=m["color"],
            overall=ov,
            verdict=vd,
            scores=scores,
            chain=chain,
            kg=dict(nodes=kg_nodes, edges=kg_edges),
            ndvi=dict(
                mine=mine,
                value=nv,
                verdict=nvv,
                thumb=thumb_rel,
                png=geo_rel,
                center=[
                    float(mine_row["latitude"]),
                    float(mine_row["longitude"]),
                ],
                bounds=geo_bnd
                or ndvi_bounds(
                    float(mine_row["latitude"]), float(mine_row["longitude"])
                ),
            ),
            pdf=pdf_rel,
        )
        if key == "gold":
            cobj["cahra"] = str(cahra.get(mcty, "no"))
        json.dump(cobj, open(f"{OUT}/company/{cid}.json", "w"), indent=1)
        companies_meta.append(company)
        companies_out.append(
            dict(
                id=cid,
                mineral=key,
                mineral_label=m["label"],
                company=company,
                origin_mine=mine,
                origin_country=mcty,
                overall=ov,
                verdict=vd,
            )
        )
        # per-path nodes for the maps (markers + arcs share these coords)
        path_nodes = []
        for n in chain:
            nd_ = dict(
                lat=n["lat"],
                lon=n["lon"],
                tier=n["tier"],
                node_name=n["node_name"],
                company=n["company"],
                country=n["country"],
            )
            if n["tier"] == "Mining":
                nd_["thumb"] = thumb_rel
                nd_["ndvi"] = nv
                nd_["ndvi_verdict"] = nvv
                if key == "gold":
                    nd_["cahra"] = str(cahra.get(mcty, "no"))
            path_nodes.append(nd_)
        paths_out.append(
            dict(
                id=cid,
                mineral=key,
                company=company,
                verdict=vd,
                overall=ov,
                mine=mine,
                cahra=(str(cahra.get(mcty, "no")) if key == "gold" else None),
                nodes=path_nodes,
            )
        )
    # per-mineral geojson
    json.dump(
        dict(type="FeatureCollection", features=gej_features),
        open(f"{OUT}/geojson/{key}.geojson", "w"),
    )
    vc = res.verdict.value_counts().to_dict()
    minerals_out.append(
        dict(
            key=key,
            label=m["label"],
            tag=m["tag"],
            color=m["color"],
            uses=m["uses"],
            regulation=m["reg"],
            regime=m["regime"],
            companies=companies_meta,
            production=production,
            prod_source=prod_source,
            prod_page=prod_page,
            world_total=world_total,
            top_country=topc.country,
            top_share=float(topc.world_share_pct),
            crma_fail=bool(topc.world_share_pct > 65),
            verdicts=dict(
                PASS=int(vc.get("PASS", 0)),
                WARN=int(vc.get("WARN", 0)),
                FAIL=int(vc.get("FAIL", 0)),
            ),
        )
    )

# combined geojson + indexes + manifest
allf = []
for key in MIN:
    allf += json.load(open(f"{OUT}/geojson/{key}.geojson"))["features"]
json.dump(
    dict(type="FeatureCollection", features=allf),
    open(f"{OUT}/geojson/all.geojson", "w"),
)
json.dump(minerals_out, open(f"{OUT}/minerals.json", "w"), indent=1)
json.dump(companies_out, open(f"{OUT}/companies.json", "w"), indent=1)
json.dump(paths_out, open(f"{OUT}/paths.json", "w"), indent=1)
import glob
import hashlib

h = hashlib.sha1()
for f in sorted(glob.glob(f"{OUT}/**/*.json", recursive=True)):
    h.update(open(f, "rb").read())
json.dump(
    dict(
        version=h.hexdigest()[:12],
        minerals=len(minerals_out),
        companies=len(companies_out),
        note="NDVI read from ndvi.csv (cached); never recomputed at build time",
    ),
    open(f"{OUT}/manifest.json", "w"),
    indent=1,
)
print(
    f"BUILD OK  minerals={len(minerals_out)} companies={len(companies_out)} version={h.hexdigest()[:12]}"
)
print("assets:", len(os.listdir(ASSET_NDVI)), "ndvi pngs")
