"""One-time NDVI raster export for the Leaflet ImageOverlay.
Recomputes Sentinel-2 NDVI per mine (same logic as the notebooks) but reprojects
to EPSG:4326 and saves a colorized single-band PNG (transparent nodata) + bounds,
so the web app can overlay it directly. Runs once; output is cached & uploaded.

  crm_sc_venv/bin/python webapp/pipeline/export_ndvi_rasters.py --test   # one mine
  crm_sc_venv/bin/python webapp/pipeline/export_ndvi_rasters.py          # all mines
"""
import os, re, sys, json, math, warnings
import numpy as np, pandas as pd
import pystac_client, odc.stac
import matplotlib

matplotlib.use("Agg")
import matplotlib.colors as mcolors
from matplotlib import colormaps
from PIL import Image

warnings.simplefilter("ignore")
STAC_URL = "https://earth-search.aws.element84.com/v1"
COLLECTION = "sentinel-2-l2a"
DATE = "2023-01-01/2024-12-31"
VALID_SCL = [4, 5, 6, 7]
BUF_KM = 5.0
CMAP = colormaps["RdYlGn"]
NORM = mcolors.Normalize(vmin=-0.2, vmax=0.8)
MIN = {
    "lithium": "Lithium_ds",
    "rare_earths": "Rare_Earth_Elements_ds",
    "gold": "Gold_ds",
}
def safe(s):
    return re.sub(r"[^A-Za-z0-9]+", "_", str(s)).strip("_")

cat = pystac_client.Client.open(STAC_URL)

def bbox(lat, lon, km=BUF_KM):
    dlat = km / 111.0
    dlon = km / (111.0 * math.cos(math.radians(lat)))
    return [lon - dlon, lat - dlat, lon + dlon, lat + dlat]

def search(bb):
    for cl in (20, 40, 80):
        items = list(
            cat.search(
                collections=[COLLECTION],
                bbox=bb,
                datetime=DATE,
                query={"eo:cloud_cover": {"lt": cl}},
            ).items()
        )
        if items:
            items.sort(key=lambda it: it.properties.get("eo:cloud_cover", 100))
            return items[:15]
    return []

def export(lat, lon, outpng):
    bb = bbox(lat, lon)
    items = search(bb)
    if not items:
        return None
    ds = odc.stac.load(
        items,
        bands=["red", "nir", "scl"],
        bbox=bb,
        crs="EPSG:4326",
        resolution=0.0003,
        groupby="solar_day",
        chunks={},
    )
    valid = ds.scl.isin(VALID_SCL)
    red = ds.red.where(valid).astype("float32")
    nir = ds.nir.where(valid).astype("float32")
    ndvi = ((nir - red) / (nir + red)).median(dim="time").compute()
    ydim = "latitude" if "latitude" in ndvi.dims else "y"
    xdim = "longitude" if "longitude" in ndvi.dims else "x"
    ndvi = ndvi.sortby(ydim, ascending=False)  # north-up for ImageOverlay
    arr = ndvi.values
    if np.all(np.isnan(arr)):
        return None
    s, n = float(ndvi[ydim].min()), float(ndvi[ydim].max())
    w, e = float(ndvi[xdim].min()), float(ndvi[xdim].max())
    mask = np.isnan(arr)
    rgba = CMAP(NORM(np.where(mask, -0.2, arr)))
    rgba[..., 3] = np.where(mask, 0.0, 1.0)
    Image.fromarray((rgba * 255).astype("uint8"), "RGBA").save(outpng)
    return [[round(s, 5), round(w, 5)], [round(n, 5), round(e, 5)]]

def mines():
    out = []
    for key, folder in MIN.items():
        df = pd.read_csv(f"cs_data/{folder}/supply_chain.csv").rename(
            columns={"lat": "latitude", "lon": "longitude"}
        )
        m = df[df.tier == "Mining"].drop_duplicates("node_name")
        for _, r in m.iterrows():
            out.append((key, r["node_name"], float(r.latitude), float(r.longitude)))
    return out

if __name__ == "__main__":
    test = "--test" in sys.argv
    todo = mines()
    if test:
        todo = [next(t for t in todo if t[1] == "Sukari")]
    bounds = {k: {} for k in MIN}
    for key, name, lat, lon in todo:
        d = f"reports/_assets/{key}/ndvi_geo"
        os.makedirs(d, exist_ok=True)
        outpng = f"{d}/{safe(name)}.png"
        print(f"[{key}] {name} ({lat:.4f},{lon:.4f}) ...", flush=True)
        try:
            b = export(lat, lon, outpng)
            if b:
                bounds[key][safe(name)] = b
                print(f"    OK -> {outpng}  bounds={b}", flush=True)
            else:
                print("    no imagery", flush=True)
        except Exception as ex:
            print(f"    ERROR {ex}", flush=True)
    if not test:
        for key in MIN:
            json.dump(
                bounds[key],
                open(f"reports/_assets/{key}/ndvi_geo/bounds.json", "w"),
                indent=1,
            )
    print("DONE", "(test)" if test else "")
