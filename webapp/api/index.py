"""Thin FastAPI backend (Vercel Python serverless).
Serves the precomputed data contract from webapp/public/data — NO geospatial
deps, NO NDVI recompute. Heavy work happens offline in pipeline/build_data.py.
"""
import json
import os
from typing import Optional

from fastapi import FastAPI, HTTPException

app = FastAPI(title="CRM Supply-Chain Plausibility API", version="0.1.0")

DATA = os.path.join(os.path.dirname(__file__), "..", "public", "data")


def _load(rel: str):
    fp = os.path.join(DATA, rel)
    if not os.path.exists(fp):
        raise HTTPException(status_code=404, detail=f"not found: {rel}")
    with open(fp) as f:
        return json.load(f)


@app.get("/api/health")
def health():
    return {"ok": True, "manifest": _load("manifest.json")}


@app.get("/api/minerals")
def minerals():
    return _load("minerals.json")


@app.get("/api/companies")
def companies(mineral: Optional[str] = None, verdict: Optional[str] = None):
    items = _load("companies.json")
    if mineral:
        items = [c for c in items if c["mineral"] == mineral]
    if verdict:
        items = [c for c in items if c["verdict"] == verdict.upper()]
    return items


@app.get("/api/company/{company_id}")
def company(company_id: str):
    return _load(f"company/{company_id}.json")
